import Tone from 'tone';
                // 0    1       2     3     4     5     6       7     8     9     10      11  
const note_arr = ['C4', 'C#4', 'D4', 'Eb4', 'E4', 'F4', 'F#4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4',
                // 12   13      14    15    16    17    18     19    20     21    22      22
                  'C5', 'C#5', 'D5', 'Eb5', 'E5', 'F5', 'F#5', 'G5', 'Ab5', 'A5', 'Bb5', 'B5'];

var max_leap_arr = [0,1,2,4,5,7,9,11,12];

function rand(num) {
  return Math.floor(Math.random() * num);
}
// return a number between min_val (inclusive) and max_val (exclusive)
// 
function rand_leap_between(prev_val, max_leap, max_val, min_val = 0) {
  // return an array with every element +- max_leap distance away from prev_note_index
  // random number between x1 .. x2
  var x1 = Math.max(min_val, prev_val - max_leap);
  var x2 = Math.min(prev_val + max_leap, max_val);
  console.log("between:",x1,x2,x2-x1);
  return x1 + Math.floor(Math.random() * (x2 - x1 + 1));
}
/*
This is a stateless, non-rendering tone generate. It does one thing: plays notes 
*/
class ToneGen {
  
  int_note_arr = [];
  max_leap;
  num_notes;
  prev_note_index = -1;

  constructor(num_notes=3, max_leap=3, mode="major") {
    
    switch (mode) {
      case "major" : this.int_note_arr = [0,1,2,4,5,6,9,11,12]; // [C, C#, D, E, F, F#, A, B, C]
        break;
      case "minor" : this.int_note_arr = [1,2,3,5,7,8,10,11,12];
        break;
    }
    // use an array instead of a switch here
    // this.max_leap = (max_leap < 9) ? max_leap_arr[max_leap] : max_leap;
    this.max_leap = max_leap;

    this.num_notes = num_notes;

    this.synth = new Tone.Synth().toMaster();

    this.random_note = this.random_note.bind(this);
    this.play_note = this.play_note.bind(this);
    this.play_rand_note = this.play_rand_note.bind(this);
  }

  random_note() {
    // sentinel: no previous note exists
    if (this.prev_note_index === -1) {
      this.prev_note_index = rand(this.int_note_arr.length)
      return note_arr[this.int_note_arr[this.prev_note_index]];
    } else {
      console.log("rand_note: ", this.prev_note_index, this.max_leap, this.int_note_arr.length);
      this.prev_note_index = rand_leap_between(this.prev_note_index, this.max_leap, this.int_note_arr.length - 1);
      console.log("note:", this.prev_note_index, note_arr[this.int_note_arr[this.prev_note_index]])
      return note_arr[this.int_note_arr[this.prev_note_index]];
    }
  }

  play_note(note, duration='4n') {
    //play the note for the duration of an quarter note
    this.synth.triggerAttackRelease(note, duration);
  }
  
  play_notes(note_arr, duration='4n', gap=1) {
    var time = 0.25
    for (let i = 0; i < note_arr.length; ++i) {
      this.synth.triggerAttackRelease(note_arr[i], duration, "+"+time);
      time += gap;
    }
  }

  play_rand_note(duration='4n') {
    var note = this.random_note(duration);
    this.play_note(note);
    return note;
  }

  play_rand_seq(duration='4n', gap=1) {
    var note_arr = []
    var time = 0.25
    for (let i = 0; i < this.num_notes; ++i) {
      note_arr[i] = this.random_note();
      // console.log(note_arr[i]);
      this.synth.triggerAttackRelease(note_arr[i], duration, "+"+time);
      time += gap;
    }
    return note_arr;
  }
}

export default ToneGen;