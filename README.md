# 🌐 ipquery-js

## What is IPQuery?

A [very cool service](https://ipquery.io/) for fetching information about IP addresses.

## Disclaimer

This package is not affiliated, associated neither endorsed by [IPQuery](https://github.com/ipqwery).

## Install


```bash
# npm
npm install ipquery

# pnpm
pnpm add ipquery

# yarn
yarn add ipquery
```

## Usage

### Fetching your own ip

```ts
import { ip } from 'ipquery'

const myself = async () => await ip.query("self")
```

### Fetching an specific ip

```ts
import { ip } from 'ipquery'

const processPayment = async (customer: Customer) => {
    
    const ipAddress = await ip.query(customer.ip)

    const timezone = ip.location.timezone

    ...
}
```

### Bulk requesting ips (up to 10k)

```ts 
import { ip } from 'ipquery'

const getUsersTimezones = async (users: User[]) => {
    const ips = await ip.query(users.map(u => u.ip))

    const timezones = ips.map(ip => ip.location.timezone)

    return timezones
}
```

### Response formatting

```ts
import { ip } from 'ipquery'

const getYamlIp = async (ipAddress: string) => {
    const yamlText = await ip.query(ipAddress, { format: "yaml" })

    return yamlText
}
```

## Caching

By default, `ip.query` will cache no more than 100 items, and it will clear after 5 minutes. 

You can config or opt out the caching by using `ip.config({ cache })` somewhere in your app.