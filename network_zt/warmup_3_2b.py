import ipaddress

my_ip = "192.168.100.33"
prefix = 16

net = ipaddress.ip_network(f"{my_ip}/{prefix}", strict=False)

print(net.netmask)
print(net.network_address)
print(net.broadcast_address)