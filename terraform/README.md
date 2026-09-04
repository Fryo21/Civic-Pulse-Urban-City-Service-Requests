# Terraform

This configuration manages the Azure infrastructure for the Civic Pulse crime
data pipeline: a resource group, two storage accounts, a Data Factory, a
Postgres Flexible Server, a Function App (+ service plan), and monitoring
(action group + metric alert).

## Why this exists

The resources above were originally created by hand / via ad-hoc scripts,
before Terraform was introduced. This configuration was written to describe
exactly what already existed in Azure, and the existing resources were then
brought under Terraform's management with `terraform state mv` — not
destroyed and recreated. If you run `terraform plan` and see an unexpected
`destroy`/`create` pair for something that already exists, stop and check
state addressing before applying; that's the failure mode this setup is
built to avoid.

## Layout

```
terraform/
├── main.tf                # root: provider, backend, module wiring
├── variables.tf            # root variable declarations (no defaults)
├── terraform.tfvars         # actual values for every root variable
└── modules/
    ├── resource-group/
    ├── storage/
    ├── data-factory/
    ├── postgres/
    ├── function-app/
    └── monitoring/
        ├── main.tf          # resources + outputs only
        └── variables.tf     # variable declarations only
```

Every module's `variables.tf` only declares inputs (type, description,
`sensitive` where relevant) — it never carries default values. Root
`variables.tf` follows the same rule. All actual values live in
`terraform.tfvars`, which is the single place to change an environment
setting.

## Remote state

State is stored in Azure Blob Storage rather than locally:

- Storage account: `teraformstate1212`
- Container: `tfstate`
- Blob key: `london-crime.tfstate`
- Auth: Azure AD (`use_azuread_auth = true` in the `backend "azurerm"` block
  in [main.tf](main.tf)) — no storage account key is used or stored anywhere.

Anyone running Terraform against this config needs the **Storage Blob Data
Contributor** role on `teraformstate1212`, granted at the storage account
scope. Without it, `terraform init` / `plan` / `apply` fail with a 403
(`AuthorizationPermissionMismatch`) when reading or writing the state blob.

## Known drift: resource group location

The resource group's `location` in Azure is `ukwest`, while every resource
inside it (storage accounts, Data Factory, Postgres, Function App) actually
runs in `norwayeast` — set via `var.location` in `terraform.tfvars`. Azure
does not allow an existing resource group's location to change in place, so
matching them would mean destroying and recreating the resource group (and
cascading into everything inside it).

Since that's not something to do casually, [modules/resource-group/main.tf](modules/resource-group/main.tf)
ignores drift on that one attribute:

```hcl
lifecycle {
  ignore_changes = [location]
}
```

`terraform plan` will never again try to replace the resource group over
this mismatch. If the resource group's actual location is ever deliberately
changed (e.g. a genuine environment migration), that ignore rule is what to
remove first.

## Usage

```sh
terraform init      # picks up the azurerm backend, needs the RBAC role above
terraform plan       # review changes before applying
terraform apply
```

## Notes

- `postgressql_admin_password` in `terraform.tfvars` is a placeholder value
  and is committed to this repo. Treat it as compromised — rotate it and move
  it to a proper secret store (e.g. Key Vault, or a gitignored `.auto.tfvars`)
  before this goes anywhere near production.
- `.terraform/`, `*.tfstate*`, and Terraform override files are gitignored;
  `.terraform.lock.hcl` is committed intentionally to pin provider versions.
