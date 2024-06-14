import './Menu.scss';

import { useNavigate } from "react-router-dom";

export default function Menu() {
    const navigate = useNavigate();

    return (<>
    <div className="Menu">
        <div className="div1 MenuItem" onClick={() => navigate('/game')}><h1>Play</h1></div>
        <div className="div2 MenuItem" onClick={() => navigate('/game')}><h1>Browse</h1></div>
        <div className="div3 MenuItem" onClick={() => navigate('/deck')}><h1>Decks</h1></div>
        <div className="div4 MenuItem" onClick={() => navigate('/404')}><h1>Watch</h1></div>
        <div className="div5 MenuItem" onClick={() => navigate('/404')}><h1>Settings</h1></div>
    </div>
    </>);
}