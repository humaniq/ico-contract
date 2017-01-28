# create two accounts with 1000 ETH each
testrpc --account="0x83c14ddb845e629975e138a5c28ad5a72a49252ea65b3d3ec99810c82751cc3a,1000000000000000000000" --unlock "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a" --account="0xd3b6b98613ce7bd4636c5c98cc17afb0403d690f9c2b646726e08334583de101,1000000000000000000000" --unlock "0xf1f42f995046e67b79dd5ebafd224ce964740da3"
# 0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a - account for the first given private key
# 0xf1f42f995046e67b79dd5ebafd224ce964740da3 - account for the second givern private key

# use the first account as founder of the contracts and multisig
# use the second one as account of investor