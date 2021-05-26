import styled from 'styled-components';
import { Card } from 'antd';

import productsJson from '../../assets/products.json';
import { useHistory } from 'react-router-dom';

const { Meta } = Card;

const LandingPageContainer = styled.div`
  padding: 4em;
  background: white;
  height: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
`;

const ProductCard = styled(Card)`
  width: 250px;
  margin: auto;
  cursor: pointer;
`;

const StyledImage = styled.img`
  height: 200px;
`;

const LandingPage = () => {

  const history = useHistory();

  return (
    <LandingPageContainer>
      {productsJson.data && productsJson.data.map((image) => (
        <ProductCard
          onClick={() => history.push(`/product/${image.id-1}`)}
          key={image.id}
          cover={
            <StyledImage
              alt={image.title}
              src={image.source}
            />}
        >
          <Meta
            title={image.title}
            description={image.description}/>
        </ProductCard>
      ))}
    </LandingPageContainer>
  )
}

export default LandingPage;