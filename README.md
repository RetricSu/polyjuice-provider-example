# @polyjuice-provider react test example

this project is a simple react dapp example used to test with [@polyjuice-provider](https://github.com/nervosnetwork/polyjuice-provider) module.

## How To Run

```sh
yarn
```

create `.env` file. (due to React's env variable issue, the extra `REACT_APP_` prefix is required, and please do not use in production, it is unsafe).

```sh
cat > ./.env <<EOF
REACT_APP_WEB3_JSON_RPC=<godwoken web3 rpc>
REACT_APP_WEB3_WS_JSON_RPC=<godwoken web3 websocket rpc>
REACT_APP_PRIVATE_KEY=<your eth test private key, do not use in production>
REACT_APP_ETH_ADDRESS=<your eth test address, match with private_key above>
EOF
```

start run:

```sh
yarn start
```

go to browser and access `http://localhost:3000`
