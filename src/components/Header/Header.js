import './Header.scss';
import logo from '../../images/book-heart-solid-72.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faCookie } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
    const { pathname } = useLocation();

    return ((pathname !== "/login" && pathname !== "/signup") ? <>
        <div className="HeaderContainer">
        <Link className="HeaderHome" to='/home'>
            <FontAwesomeIcon className="HeaderLink" icon={faBook} style={{fontSize: '40px'}}/>
        </Link>
        <FontAwesomeIcon className="HeaderLink" icon={faUser} style={{fontSize: '40px'}}/>
        </div>    
    </> : <></>);
}