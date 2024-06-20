import './Modal.scss';


export const Modal = ({ children }) => {

    return (
        <div className="modal"> 
            <div className="modalContent">
                { children }
            </div>
        </div>
    )
}