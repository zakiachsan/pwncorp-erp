import paramiko
import time

host = "43.157.225.242"
user = "ubuntu"
password = "[REDACTED]"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=15)

commands = [
    "cd /home/ubuntu/pwncorp-erp",
    "git pull origin main",
    "npx prisma db push --accept-data-loss",
    "npm run build 2>&1 | tail -20",
    "pm2 restart pwncorp-erp",
    "pm2 status pwncorp-erp",
]

for cmd in commands:
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out)
    if err: print(err)

client.close()
