/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

// Components
import Navigation from './Navigation';
import Info from './Info';
import Loading from './Loading';
import Progress from './Progress';

// ABIs
import TOKEN_ABI from '../abis/Token.json';
import CROWDSALE_ABI from '../abis/Crowdsale.json';

// config
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [crowdsale, setCrowdsale] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockChainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    console.log('Provider:', provider);

    // Initiate contracts
    const { chainId } = await provider.getNetwork();
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
    setCrowdsale(crowdsale);
    console.log('Token:', token.address);

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    // Fetch account balance
    const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18);
    setAccountBalance(accountBalance);

    setPrice(ethers.utils.formatUnits(await crowdsale.price(), 18));
    setMaxTokens(ethers.utils.formatUnits(await crowdsale.maxTokens(), 18));
    setTokensSold(ethers.utils.formatUnits(await crowdsale.tokensSold(), 18));
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      loadBlockChainData();
    }
  }, [isLoading]);

  return (
    <Container>
      <Navigation />
      <h1 className="my-4 text-center">Introducing Moon Lambo Token!</h1>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className="text-center ">
            <strong>Current Price:</strong> {price} ETH
          </p>
          <Progress maxTokens={maxTokens} tokensSold={tokensSold} />
        </>
      )}
      <hr />
      {account && <Info account={account} accountBalance={accountBalance} />}
    </Container>
  );
}

export default App;
