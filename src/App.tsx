import styled from 'styled-components';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { BN, units } from '@zilliqa-js/util';
import LandingPage from './screens/landing/LandingPage';
import ProductPage from './screens/product/ProductPage';
import './App.css';

import { Layout, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

const { Header, Content } = Layout;

const StyledHeader = styled(Header)`
  position: fixed;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  align-items: center;
`;

const StyledContent = styled(Content)`
  margin-top: 64px;
  height: calc(100vh - 64px);
`;

const StyledButton = styled.button`
  height: 50%;
  background: #001529;
  color: white;
  vertical-align: middle;
  border: 2px solid palevioletred;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: 5px;
`;

const StyledDiv = styled.div`
  color: white;
  margin-right: 10px;
  cursor: pointer;
`;

const StyledLeftDiv = styled.div`
  position: absolute;
  left: 30px;
  padding: 10px;
  color: white;
  font-weight: bold;
  color: skyblue;
  cursor: pointer;
`;

const myWindow: any = window;

const App = () => {

  const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
  const history = useHistory();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [zilPay, setZilPay] = useState<any | undefined>(undefined);
  const [zilBalance, setZilBalance] = useState<number | undefined>(undefined);
  const [zilContract, setZilContract] = useState<any | undefined>(undefined);
  const [zilContractState, setZilContractState] = useState<any | undefined>(undefined);
  const [points, setPoints] = useState<number> (0);

  const getContractState = useCallback(async () => {
    if (zilPay === undefined) {
      return;
    }
    const contract = await zilPay.contracts.at("0x3ea8d25d9ef09fac7c181fafc56f361248650ee2");
    setZilContract(contract);
    const contractState = await contract.getState();
    setZilContractState(contractState);
  }, [zilPay])

  useEffect(() => {
    const zilPay = myWindow.zilPay
    if (zilPay === undefined) {
        return;
    }
    setZilPay(zilPay);
    try {
      // zilPay.wallet.observableBlock().subscribe((block: any) => {
          // const blockNumber = parseInt(block.TxBlock.header.BlockNum);
          // setCurrentBlockNumber(blockNumber);
      //     getContractState();
      // });
      // zilPay.wallet
      //     .observableAccount()
      //     .subscribe(() => getContractState());
      getContractState();
    } catch (e) {
      console.log(e);
    }
  }, [getContractState]);


  const connectZilPay = async () => {
    if (myWindow.zilPay.wallet.isEnable) {
      return;
    } else {
      await myWindow.zilPay.wallet.connect();
    }
  }

  const getZilBalance = () => {
    zilliqa.blockchain.getBalance(
      zilPay.wallet.defaultAccount.base16
    ).then(balanceRes => {
      if (balanceRes) {
        setZilBalance(parseFloat(units.fromQa(new BN(balanceRes.result.balance), units.Units.Zil)))
      }
      setIsModalVisible(true);
    });
  }

  const closeModal = () => {
    setIsModalVisible(false);
  }

  return (
    <Layout>
      <StyledHeader>
        <StyledLeftDiv onClick={() => history.push('/')}>Loyalty Rewards</StyledLeftDiv>
        {zilPay && <StyledDiv>Reward Points: {points}</StyledDiv>}
        {zilPay && <StyledDiv onClick={getZilBalance}>Zilliqa address: {zilPay.wallet.defaultAccount.bech32}</StyledDiv>}
        {!zilPay && <StyledButton onClick={connectZilPay}>Connect wallet</StyledButton>}
      </StyledHeader>
      <StyledContent>
        <Modal title="Zilliqa account balance" visible={isModalVisible} onOk={closeModal} onCancel={closeModal}>
          {zilBalance} Zil
        </Modal>
        <Switch>
          <Route exact path='/'>
            <LandingPage />
          </Route>
          <Route path='/product/:id'>
            <ProductPage zilContract={zilContract} zilPay={zilPay} points={points} setPoints={setPoints}/>
          </Route>
        </Switch>
      </StyledContent>
    </Layout>
  );
}

export default App;
