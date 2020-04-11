import React, { useState } from 'react';
import { BrowserRouter, Link, Switch, Route } from 'react-router-dom';

import './App.css';
import TrainData from './train.js';
import {Piano , PianoPhone} from './piano.js';
import Results from './results.js';
import Settings from './settings.js';
import ToneGen from './ToneGenerator';

var trainData = new TrainData();
var toneGen = null;

class App extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      // all settings for the app are stored here
      ui : "piano",   // ui to use
      
      replay : true,  // allow the user to replay notes
      
      max_leap : 3,   // maximum interval of toneGen
      mode : "major", // mode of toneGen
      num_notes: 3,   // number of notes to play at a time
      range: 2,       // range of toneGen
      gap : 1,        // seconds gap between notest
      duration: '4n', // note duration
      // synth to use
      // this is a nested object. That's usually bad
      // this means it will be hard to update 
      // (eg setState({synth : synth_obj}) will set this object,
      // NOT merge with it
      synth : {
        "oscillator" : {
          "type" : "triangle"
        },
        "envelope" : {
          "attackCurve" : "exponential",
          "attack" : 0.02,
          "decayCurve" : "exponential",
          "decay" : 0.03,
          "sustain" : 0.4,
          "releaseCurve" : "exponential",
          "release" : 0.5,
        },
        "portamento" : 0.0,
        "volume" : -15
      }
    }

    this.onStart = this.onStart.bind(this);
    this.swapUI = this.swapUI.bind(this);
  }

  onStart() {
    console.log("resetting train data");
    trainData = new TrainData();
    toneGen = new ToneGen(this.state);
  }

  swapUI() {
    if (this.state.range === 1) {
      this.setState({range : 2});
    }
    else if (this.state.range === 2) {
      this.setState({range : 1});
    }
    toneGen = new ToneGen(this.state)
  }

  render() {
    console.log("this.state.gap", this.state.gap);
    var ui;
    if (this.state.ui === "piano") {
      if (this.state.range === 1) {
        ui = PianoPhone;
      }
      else {
        ui = Piano;
      }
    }
    return(
    <header className="App App-header">
      <h1>Aural Training</h1> 
      <BrowserRouter>
        <Switch>
          <Route path='/settings'>
            <Settings />
          </Route>
          <Route path='/results'>
            <ResultsView 
              trainData={trainData}
            />
          </Route>
          <Route path='/train'> 
            <TrainView 
              trainData = {trainData} 
              replay = {this.state.replay} 
              ui = {ui}
              duration = {this.state.duration}
              max_leap = {this.state.max_leap}
              mode = {this.state.mode}
              num_notes = {this.state.num_notes}
              range = {this.state.range}
              gap = {this.state.gap}
              synth = {this.state.synth}
            /> 
          </Route>
          <Route path='/'> 
            <PlayView 
              swapUI={this.swapUI}
              onStart={this.onStart} 
              ui={ui}
              duration = {this.state.duration}
              max_leap = {this.state.max_leap}
              mode = {this.state.mode}
              num_notes = {this.state.num_notes}
              range = {this.state.range}
              gap = {this.state.gap}
              synth = {this.state.synth}
            />
          </Route>
        </Switch>
      </BrowserRouter>
    </header>
  );}
}

function PlayView (props) {
  // react hooks!
  const [note, setNote] = useState('');
  
  return (
  <div>
    <button className="App-button colorPurple" onClick={(e) => props.swapUI()}>UI</button>
    <p>
      <Link to='/train'>
        <button className="App-button colorGreen" onClick={props.onStart}>Start</button>
      </Link>
      <Link to='/settings'>
        <button className="App-button colorCoral">Settings</button>
      </Link>
      <Link to='/results'>
        <button className="App-button colorYellow">Results</button>
      </Link>
    </p>
    <div>
      <p>Play a Note:</p>
      <props.ui 
        onNoteClick = {(note) => {
          console.log(note);
          // need to do it this way so that the AudioContext is created by the user
          // for Chrome
          if (toneGen === null) {
            toneGen = new ToneGen(props)
          }
          toneGen.play_note(note); 
          setNote(note)}
        }
      />
      <p>Note Played:</p>
      <p>{note}</p>
    </div>
  </div>
  );
}

function TrainView (props) {
  const [notes, setNotes] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState(null);
  // const toneGen = new ToneGen();
  return (
    <div>
      <p>
        <Link to='/'>
          <button className="App-button colorGreen">Stop</button>
        </Link>
        <Link to='/settings'>
          <button className="App-button colorCoral">Settings</button>
        </Link>
        <Link to='/results'>
          <button className="App-button colorYellow">Results</button>
        </Link>
      </p>
      <div className="App">
        <div>
          {props.replay && 
              <button className="App-button colorYellow"
                  onClick={(e) => {
                    if (toneGen !== null) {
                      console.log("replay:", notes);
                      toneGen.play_notes(notes)
                    }
                  }}>
                Replay
              </button>
            }
            <button className="App-button colorGreen"
                onClick={(e) => {
                  // need to do it this way so that the AudioContext is created by the user
                  // for Chrome
                  if (toneGen === null) {
                    toneGen = new ToneGen(props)
                  }
                  var note_arr = toneGen.play_rand_seq()
                  setNotes(note_arr);
                  console.log(note_arr);
                  trainData.addNoteArr(note_arr);
                }}>
              Next Note
            </button>
          </div>
          <props.ui
            onNoteClick = {(note) => {
              if (!trainData.guessed) {
                setGuess(note);
              }
              setResult(trainData.addGuess(note));
            }}
          />
        <p>You Guessed:</p>
        <p>{guess}{result === null ? '' : (result ? ' : Correct' : ' : Incorrect')}</p>
      </div>
    </div>
  );
}

function ResultsView (props) {
  return (
    <div> 
    <p>
      <Link to='/'>
        <button className="App-button colorGreen">Start Over</button>
      </Link>
      <Link to='/settings'> 
        <button className="App-button colorCoral">Settings</button>
      </Link>
      <Link to='/train'>
        <button className="App-button colorYellow">
          Continue
        </button>
      </Link>
    </p>
    <Results
        guesses = {trainData.guess_stack}
        notes   = {trainData.note_stack}
        results = {trainData.result_stack}
        score   = {trainData.calcScore()}
    />
  </div>
  );
}

export default App;
