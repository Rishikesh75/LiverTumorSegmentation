# Deploy the ML service to a low-cost EC2 instance

This deploys only the FastAPI/PyTorch service in `ml_service/`. The GitHub
Actions workflow publishes the image to GitHub Container Registry (GHCR) as
`ghcr.io/rishikesh75/livertumorsegmentation:latest` when changes are pushed to
`main`. Terraform provisions one CPU-only EC2 instance and a security group;
Ansible pulls that published image and waits for its health endpoint.

## Run deployment from GitHub Actions

The deployment workflow runs on a GitHub-hosted runner, so you do not need to
install Terraform or Ansible locally. It is deliberately manual to avoid
recreating chargeable AWS resources after you destroy them:

1. Create an S3 bucket in your AWS account for Terraform state. Keep S3 Block
   Public Access enabled, enable bucket versioning and default encryption, and
   note the bucket name. The workflow uses S3 native state locking.
2. Create an AWS IAM OIDC identity provider for
   `token.actions.githubusercontent.com` if your account does not already have
   one. Create an IAM role whose trust policy allows
   `sts:AssumeRoleWithWebIdentity` only for this repository's `main` branch:
   `repo:Rishikesh75/LiverTumorSegmentation:ref:refs/heads/main`. Grant that
   role the required EC2 instance/security-group permissions and access to
   read/write/delete the Terraform state and lock objects in the state bucket.
   Do not use long-lived AWS access keys in GitHub.

   The role trust policy should restrict both the audience and repository
   subject (replace the account-specific OIDC provider ARN):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": {
         "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
       },
       "Action": "sts:AssumeRoleWithWebIdentity",
       "Condition": {
         "StringEquals": {
           "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
         },
         "StringLike": {
           "token.actions.githubusercontent.com:sub": "repo:Rishikesh75/LiverTumorSegmentation:ref:refs/heads/main"
         }
       }
     }]
   }
   ```

   Its permissions policy needs EC2 describe operations, instance launch and
   termination, security-group create/delete and ingress/egress rule changes,
   and S3 `GetObject`, `PutObject`, and `DeleteObject` for the state and
   `terraform.tfstate.tflock` objects plus `ListBucket` for the state bucket.
   Scope S3 access to this bucket and state key; avoid attaching unrestricted
   administrator permissions.
3. Create an EC2 key pair in the region you intend to use. Add its **private
   key** as the GitHub Actions repository secret `EC2_SSH_PRIVATE_KEY`.
4. In the repository's **Settings → Secrets and variables → Actions**, add:

   **Secrets**
   - `AWS_ROLE_ARN`: ARN of the OIDC IAM role from step 2.
   - `EC2_SSH_PRIVATE_KEY`: private key for the EC2 key pair.

   **Variables**
   - `AWS_REGION`: AWS region containing the key pair and default VPC.
   - `TF_STATE_BUCKET`: S3 bucket name from step 1.
   - `EC2_KEY_PAIR_NAME`: EC2 key pair name (not the private-key filename).
   - `API_ALLOWED_CIDR`: trusted client IPv4 CIDR for API port 5001, such as
     `198.51.100.25/32`.

   The workflow discovers its current public IP and allows SSH from that `/32`
   only while Ansible deploys; it then closes SSH ingress again. The GitHub
   token is used to pull the GHCR image; ensure the package grants this
   repository read access.
5. Push the infrastructure changes to `main`, then open **Actions → Deploy or
   destroy ML service on AWS → Run workflow**. Choose `deploy` and an image tag
   (`latest` or a commit SHA). The workflow initializes Terraform using S3
   state, creates/updates the EC2 resources, installs Ansible on the runner,
   and deploys the GHCR image over SSH.
6. When you want to stop AWS compute charges, run the same workflow with
   `destroy` and type `DESTROY` in the confirmation field. This removes the EC2
   instance, its attached disk, and the security group managed by this
   Terraform state. The S3 state bucket and GHCR image remain.

This destroy action does not delete resources created manually in the AWS
console or tracked in a different Terraform state. Confirm the resources shown
in the Terraform destroy plan before approving it.

The Terraform state bucket must exist before running the workflow. For an
empty new deployment, the first workflow run creates the application
infrastructure and stores its state in that bucket.

### Test Docker without pulling the large ML image

After deploying the EC2 instance, run **Actions → Test Docker pull on AWS EC2
→ Run workflow** from `main`. This separate smoke test uses the same AWS
OIDC role, Terraform S3 state, EC2 SSH key, and repository variables as the
deployment workflow. It refuses to create an instance if Terraform state does
not already contain one, temporarily opens SSH from the GitHub runner, then
asks EC2 to pull and run the small public `hello-world:latest` image. SSH
ingress is closed again in a cleanup step.

The workflow passes only if the image pull succeeds and its container prints
`Hello from Docker!`. This tests the AWS credentials, Terraform state access,
SSH connectivity, and Docker Hub image-pull path without downloading the
PyTorch application image. It does not deploy or modify the ML service
container.

### If you already created resources using local Terraform state

Do not run the GitHub destroy workflow until the existing Terraform state has
been migrated to the S3 backend; otherwise the workflow's empty state will not
know about those resources. From the existing local `infra/terraform` folder,
after setting AWS credentials and creating the bucket, run:

```sh
terraform init -migrate-state \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="key=infra/terraform/terraform.tfstate" \
  -backend-config="region=YOUR_AWS_REGION" \
  -backend-config="encrypt=true" \
  -backend-config="use_lockfile=true"
```

Confirm the migration prompt and retain a secure backup of the local state
until the S3-backed destroy completes. Terraform state can contain sensitive
data; never commit it to the repository. If you have resources but no usable
state, identify and import them before using the workflow's destroy option.

## Requirements

- For GitHub Actions deployment: the OIDC role, S3 state bucket, and repository
  secrets/variables described above.
- For local deployment: AWS CLI credentials with permission to manage EC2 and
  the Terraform state bucket.
- Terraform 1.10+.
- An existing EC2 key pair in the selected AWS region and its private key.
- For local Ansible deployment: Ansible on Linux/WSL (Ansible is not natively
  supported on Windows).
- A default VPC with a default subnet in the selected AWS region.

The default `t3a.medium` is a small CPU-only starting point for this PyTorch
service, with standard CPU credits enabled to avoid unlimited-credit surcharges.
A 1 GiB instance is likely too constrained for the model and image processing.
It is not a GPU instance, and segmentation latency depends on volume size. EC2,
the 20 GiB gp3 disk, and the public IPv4 address incur charges; pricing varies
by region and account. Check AWS pricing and any Free Tier eligibility before
applying.

## Local deployment alternative

Use this section only if you prefer to run deployment from your own Linux/WSL
machine. The GitHub Actions workflow above avoids installing Terraform and
Ansible locally.

### 1. Configure and create EC2

Create an EC2 key pair in your chosen region if you do not already have one.
Copy the example variables file, then set the key pair name and narrow both
CIDRs to trusted client IPs (for example, `198.51.100.25/32`):

```sh
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars
terraform init \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="key=infra/terraform/terraform.tfstate" \
  -backend-config="region=YOUR_AWS_REGION" \
  -backend-config="encrypt=true" \
  -backend-config="use_lockfile=true"
terraform plan
terraform apply
terraform output -raw instance_public_ip
```

Use the IP output for the Ansible inventory. Do not open SSH or the API to
`0.0.0.0/0` unless you intentionally want unrestricted public access. This
service does not provide authentication or HTTPS; restrict the API CIDR and do
not send sensitive medical data over the public HTTP endpoint.

### 2. Deploy with Ansible

From the repository root, copy the sample inventory and replace the public IP
and private-key path:

```sh
cp infra/ansible/inventory.ini.example infra/ansible/inventory.ini
# Edit infra/ansible/inventory.ini
ansible-playbook -i infra/ansible/inventory.ini infra/ansible/deploy.yml
```

The first deployment downloads the image from GHCR and can take several
minutes. The GHCR package must be public to pull
without credentials. For a private package, export a GitHub username and a
personal access token (classic) with the `read:packages` scope before running
Ansible:

```sh
export GHCR_USERNAME=YOUR_GITHUB_USERNAME
export GHCR_TOKEN=YOUR_PACKAGE_READ_TOKEN
ansible-playbook -i infra/ansible/inventory.ini infra/ansible/deploy.yml
```

The playbook fails if Docker Compose cannot pull the image or the `/health`
endpoint does not report `healthy`.

### 3. Check and remove

When deployment succeeds, Terraform reports the API base URL. Check
`http://<instance-public-ip>:5001/health` from an IP allowed by
`api_allowed_cidr`.

When you no longer need the instance, remove it to stop ongoing EC2, disk, and
public IPv4 charges:

```sh
cd infra/terraform
terraform destroy
```
