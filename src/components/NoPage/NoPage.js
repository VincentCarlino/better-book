
import back from '../../images/card_backing.jpeg';
import { yugioh } from '../../data/Yugioh';


export const NoPage = () => {
    return (
       <div className="center">
          <div className={"Card CardLarge Animate"} >
          <div className='CardInner'>
            <div className='CardFront'>
              <img src={yugioh.getRandomAceMonsterImage()}/>
            </div>
            <div className='CardBack'>
              <img src={back}/>
            </div>
          </div>
        </div>
        <h1 className="textCenter">404</h1>
       </div>);
  };
  