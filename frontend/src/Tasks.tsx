interface TaskCardProp {
    title: string
    status: string
    description: string
}

function TaskCard({ title, status, description }: TaskCardProp) {
    return (
        <div className="color-latter">
            <h3>{title}</h3>
            <p>Status: {status}</p>
            <p>Descrição: {description}</p>
        </div>
    )
}

export default TaskCard