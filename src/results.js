import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function getResult(result) {
    if (result)
        return '\u2713'; // unicode checkmark
    else
        return 'X';
}

function ResultItem(props) {
  return(
    <tr>
      <th className='Results-table-cell'>{props.index}.</th>
      <th className='Results-table-cell'>{props.guess}</th>
      <th className='Results-table-cell'>{props.note}</th>
      <th className='Results-table-cell'>{getResult(props.result)}</th>
    </tr>
  );
}

class Results extends React.Component {
  render() {
    return (
      <div className="App">
      <header className="App-header">
        <h1>Results</h1>
        <p>
          <Link to='/'>
            <button className="App-button colorGreen">Start Over</button>
          </Link>
          <Link to='/settings'>
            <button className="App-button colorCoral">Settings</button>
          </Link>
          <Link to='/train'>
            <button className="App-button colorYellow" onClick={this.props.onContinue}>
              Continue
            </button>
          </Link>
        </p>
        <h2>Score: {this.props.score[1]}% ({this.props.score[0]} / {this.props.notes.length})</h2>
        <table className='Results-table'>
          <thead>
            <tr>
              <th className='Results-table-cell'/>
              <th className='Results-table-cell'>Guess</th>
              <th className='Results-table-cell'>Note</th>
              <th className='Results-table-cell'>Result</th>
            </tr>
          </thead>
        <tbody>
          {this.props.guesses.map((guess, index) => (
            [guess, this.props.notes[index], this.props.results[index]]
            )).map((guess_note, index) => ( 
            <ResultItem 
                key={index} 
                index={this.props.guesses.length - index}
                guess={guess_note[0]} 
                note={guess_note[1]} 
                result={guess_note[2]}
            />
          ))}
        </tbody>
        </table>  
        </header>
      </div>
    );
  }
}

export default Results;