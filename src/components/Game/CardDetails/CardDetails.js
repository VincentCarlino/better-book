
import { yugioh } from "../../../data/Yugioh"

export function CardDetails({ card }) {
    // Displays a larger card 
    return (
    <div className='CardDetails'>{ card ? <img style={{objectFit: 'contain', width: '400px'}} src={yugioh.getImage(card.cid)}/> : <div></div>}
    </div>)


}