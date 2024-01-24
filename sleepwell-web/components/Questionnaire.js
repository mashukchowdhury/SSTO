function Questionnaire({question, inputMethod, conditionalDisplay}) {
    return (
        <div className="flex flex-col">
            <p className="flex justify-center pb-4">{question}</p>
            <div className="flex justify-center">
                {inputMethod}
            </div>
            {conditionalDisplay}
        </div>
    );
}

export default Questionnaire;