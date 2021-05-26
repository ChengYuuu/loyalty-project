import styled from 'styled-components';
import { BN, Long, bytes, units } from '@zilliqa-js/util';

import { Image, message } from 'antd';
import { useParams } from 'react-router';

import productsJson from '../../assets/products.json';

const ProductPageContainer = styled.div`
  background: white;
  height: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
`;

const RowDiv = styled.div`
  display: flex;
  flex: 0 0 100%;
  justify-content: center;
  align-items: center;
`;

const StyledButton = styled.button`
  height: 25px;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 20px;
  margin: 0 60px;
`;

interface IProductPageProps {
  zilContract: any;
  zilPay: any;
  points: number;
  setPoints: any;
}

const ProductPage = ({ zilContract, zilPay, points, setPoints } : IProductPageProps) => {

  const { id } = useParams<{ id: string }>();
  const product = productsJson.data[parseInt(id)];

  const callContract = async (currency: string) => {
    if (currency === 'lToken' && points < parseInt(product.points)) {
      message.error('Not enough reward points')
      return;
    }
    const callTx = await zilContract.call(
      'purchase',
      [
          {
              vname: 'currency',
              type: 'Uint128',
              value:  currency === 'usd' ? '0' : '1'
          },
          {
            vname: 'price',
            type: 'Uint128',
            value: currency === 'usd' ? product.usd : product.points
          }
      ],
      {
          version: bytes.pack(333, 1),
          amount: currency === 'usd' ? new BN(units.toQa(product.usd, units.Units.Zil)) : new BN(0),
          gasPrice: units.toQa('1000', units.Units.Li),
          gasLimit: Long.fromNumber(10000),
      }
    );
    if (currency === 'usd') {
      const subscription = zilPay.wallet
      .observableTransaction(callTx.ID)
      .subscribe(async (hash: any) => {
          subscription.unsubscribe();
          const Tx = await zilPay.blockchain.getTransaction(hash[0]);
          const reward = Tx.receipt.transitions[0].msg.params[0].value;
          setPoints((prevPoint: number) => prevPoint + parseInt(reward));
          console.log(reward);
      });
    } else if (currency ==='lToken') {
      setPoints((prevPoint: number) => prevPoint - parseInt(product.points));
    }

  }

  return (
    <ProductPageContainer>
      <RowDiv>
        <Image
          width={400}
          height={400}
          src={product.source}
        />
      </RowDiv>
      <RowDiv><b>{product.title}</b></RowDiv>
      <RowDiv>
        <div>USD: {product.usd}, Points: {product.points}</div>
      </RowDiv>
      <RowDiv>
        <StyledButton onClick={() => callContract('usd')}>BUY (USD)</StyledButton>
        <StyledButton onClick={() => callContract('lToken')} >Redeem (Points)</StyledButton>
      </RowDiv>
    </ProductPageContainer>
  )
}

export default ProductPage;