# Ansible Proxmox VM Provisioning & Deployment

Ansible playbook สำหรับ provision VM บน Proxmox และ deploy application พร้อม monitoring stack

## Requirements

### System Requirements
- Python 3.8+
- Ansible 2.15+
- SSH access to Proxmox server
- SSH key pair for VM authentication

### Python Dependencies
```bash
pip3 install -r requirements.txt
```

### Ansible Collections
```bash
ansible-galaxy collection install -r requirements.yml
```

## Quick Start

### 1. ติดตั้ง Dependencies

#### สำหรับ macOS
```bash
# Install Python packages
pip3 install --user -r requirements.txt

# เพิ่ม PATH สำหรับ Ansible
echo 'export PATH="$HOME/Library/Python/3.9/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# ตรวจสอบว่า Ansible ติดตั้งสำเร็จ
ansible --version

# Install Ansible collections
ansible-galaxy collection install -r requirements.yml
```

#### สำหรับ Windows

**วิธีที่ 1: ใช้ WSL2 (แนะนำ)**

Ansible ไม่รองรับ Windows native ดังนั้นแนะนำให้ใช้ WSL2 (Windows Subsystem for Linux)

```powershell
# 1. เปิด PowerShell แบบ Administrator แล้วติดตั้ง WSL2
wsl --install

# 2. Restart คอมพิวเตอร์

# 3. เปิด Ubuntu terminal แล้วติดตั้ง dependencies
sudo apt update
sudo apt install python3 python3-pip -y

# 4. ติดตั้ง Ansible
pip3 install ansible

# 5. เพิ่ม PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 6. ตรวจสอบ
ansible --version

# 7. ติดตั้ง collections
ansible-galaxy collection install -r requirements.yml
```

**วิธีที่ 2: ใช้ Git Bash + Python**

```bash
# 1. ติดตั้ง Python จาก https://www.python.org/downloads/
# 2. ติดตั้ง Git Bash จาก https://git-scm.com/downloads

# 3. เปิด Git Bash แล้วติดตั้ง Ansible
pip install ansible

# 4. ตรวจสอบ
ansible --version

# 5. ติดตั้ง collections
ansible-galaxy collection install -r requirements.yml
```

**หมายเหตุ:** Ansible Control Node ไม่รองรับ Windows native แต่สามารถจัดการ Windows hosts ได้ ดังนั้นแนะนำให้ใช้ WSL2

### 2. เตรียม SSH Key
```bash
# สร้าง SSH key (ถ้ายังไม่มี)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
```

### 3. แก้ไข Configuration

แก้ไขไฟล์ `playbook.yml` ให้ตรงกับ environment ของคุณ:

```yaml
vars:
  # Proxmox API
  proxmox_api_host: 10.13.104.217      # เปลี่ยนเป็น IP ของ Proxmox
  proxmox_api_user: root@pam           # Proxmox user
  proxmox_api_password: your_password  # Proxmox password
  proxmox_node: blade-server07         # Proxmox node name
  
  # VM Configuration
  vm_template: ubuntu-cloud-template-v2  # Template name
  vm_name: test-ansible-vm               # VM name
  vm_target_ip: 10.13.104.89            # IP ที่ต้องการ
  vm_cidr: 24
  vm_gw: 10.13.104.254                  # Gateway
  
  # SSH Key Path
  ansible_ssh_key_path: "/Users/chanatip/.ssh/id_ed25519"  # เปลี่ยนเป็น path ของคุณ
```

แก้ไขไฟล์ `inventory.ini`:

```ini
[all:vars]
ansible_user=ansible
ansible_ssh_private_key_file=/Users/chanatip/.ssh/id_ed25519  # เปลี่ยนเป็น path ของคุณ
```

### 4. รัน Playbook
```bash
ansible-playbook -i inventory.ini playbook.yml
```

## What This Playbook Does

### Play 1: Provision VM on Proxmox
1. Clone VM from template
2. Configure cloud-init (network, user, SSH key)
3. Start VM
4. Wait for SSH to be available
5. Register VM as dynamic host

### Play 2: Configure VM and Deploy Application
1. **System Setup**
   - Wait for cloud-init to complete
   - Update apt cache
   - Install base packages (git, docker, docker-compose, etc.)

2. **Application Deployment**
   - Clone repository: `https://github.com/chaaanatip/int531-demo.git`
   - Create `.env` file
   - Build and start Docker containers
   - Deploy MariaDB database
   - Deploy Node.js application

3. **Monitoring Stack**
   - Deploy Prometheus (port 9090)
   - Deploy Grafana (port 3001)
   - Deploy Node Exporter
   - Configure datasources and dashboards

## Access Information

After successful deployment:

- **Application**: `http://<vm_ip>:3000`
- **Grafana**: `http://<vm_ip>:3001` (admin/admin)
- **Prometheus**: `http://<vm_ip>:9090`
- **Metrics Endpoint**: `http://<vm_ip>:3000/api/metrics`

## Firewall Ports

The playbook automatically configures UFW to allow:
- Port 22 (SSH)
- Port 3000 (Frontend)
- Port 3001 (Grafana)
- Port 9090 (Prometheus)

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/id_ed25519 ansible@<vm_ip>
```

### Check Container Status
```bash
# SSH to VM
ssh -i ~/.ssh/id_ed25519 ansible@<vm_ip>

# Check running containers
docker ps

# Check logs
docker-compose logs -f app
```

### Ansible Verbose Mode
```bash
# Run with verbose output
ansible-playbook -i inventory.ini playbook.yml -v
ansible-playbook -i inventory.ini playbook.yml -vv   # More verbose
ansible-playbook -i inventory.ini playbook.yml -vvv  # Very verbose
```

## Project Structure

```
ansiblev2/
├── playbook.yml          # Main playbook
├── inventory.ini         # Inventory file
├── requirements.txt      # Python dependencies
├── requirements.yml      # Ansible collections
├── README.md            # This file
├── id_ed25519.pub       # Public SSH key
└── privatekey           # Private key (if applicable)
```

## Notes

- Default VM user: `ansible` (password: `ansible`)
- Application directory: `/opt/myapp`
- Docker network: `sre-network`
- Grafana admin credentials: `admin/admin` (change after first login)

## License

MIT
