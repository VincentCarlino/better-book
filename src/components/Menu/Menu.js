import './Menu.scss';
import logo from '../../images/book-heart-solid-72.png';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Menu() {
    const navigate = useNavigate();

    const disabledRoute = {textDecoration: 'line-through'}

    return (
    <div>
        <h1 className="title">Spellbook</h1>
        <div className="Menu">
            <div className="div1 MenuItem" onClick={() => navigate('/game')}><h1>Play</h1></div>
            <div className="div2 MenuItem" onClick={() => navigate('/game')} style={disabledRoute}><h1>Browse</h1></div>
            <div className="div3 MenuItem" onClick={() => navigate('/deck')}><h1>Decks</h1></div>
            <div className="div4 MenuItem" onClick={() => navigate('/404')} style={disabledRoute}><h1>Watch</h1></div>
            <div className="div5 MenuItem" onClick={() => navigate('/404')} style={disabledRoute}><h1>Settings</h1></div>
        </div>
    </div>);
}