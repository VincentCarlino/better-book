import './Header.scss';
import logo from '../../images/book-heart-solid-72.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import Routes from '../../Routes';

export default function Header() {
    const { pathname } = useLocation();

    return ((Routes.find((route) => route === pathname)) ? <>
    <div className="HeaderContainer">
        <div className="Header">
        <Link className="HeaderHome" to='/home'>
            <FontAwesomeIcon className="HeaderLink" icon={faBook} style={{fontSize: '40px'}}/>
        </Link>
        <FontAwesomeIcon className="HeaderLink" icon={faUser} style={{fontSize: '40px'}}/>
        </div>    
    </div>
    </> : <></>);
}