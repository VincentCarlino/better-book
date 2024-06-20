export const Button = ({ onClick, children }) => {
    return (
        <div className="button" onClick={onClick}>{children}</div>
    )
}