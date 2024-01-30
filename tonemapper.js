/* Microtonal filter */

var PitchleCenter = 60; /* middle c */

// ) a Map to contain the scale
// diatonic scale (white notes) 0,2,4,5,7,9,11  
const scale = new Map([
//MIDI note, pb value  
	[0 + 24, -1],
	[2 + 24, -1],
	[4 + 24, -1],
	[5 + 24, -1],
	[7 + 24, -1],
	[9 + 24, -1],
	[11 + 24, -1],
	
	[0 + 36, -1],
	[2 + 36, -1],
	[4 + 36, -1],
	[5 + 36, -1],
	[7 + 36, -1],
	[9 + 36, -1],
	[11 + 36, -1],
	
	[0 + 48, -1],
	[2 + 48, -1],
	[4 + 48, -1],
	[5 + 48, -1],
	[7 + 48, -1],
	[9 + 48, -1],
	[11 + 48, -1],
	
	[0 + 60, 1],	//middle c
	[2 + 60, 1],
	[4 + 60, 1],
	[5 + 60, 1],
	[7 + 60, 1],
	[9 + 60, 1],
	[11 + 60, 1],
	
	[0 + 72, 1],
	[2 + 72, 1],
	[4 + 72, 1],
	[5 + 72, 1],
	[7 + 72, 1],
	[9 + 72, 1],
	[11 + 72, 1],
	
	[0 + 84, 1],
	[2 + 84, 1],
	[4 + 84, 1],
	[5 + 84, 1],
	[7 + 84, 1],
	[9 + 84, 1],
	[11 + 84, 1],
	]);
	
//Current external pitchbend (regular midi pitchbend input)
var ExternalPitchBend = 0;

//Current microtonal scale value in pitchbend (value that determines microtonal pitch output when added to scaled external pitchbend)
var CurrentPitch = 0;

//Adjacent upper pitchbend range for current microtonal scale value. (+1 scale value, deal with scale overflow by clipping)
var LowerRange = 0;

//Adjacent lower pitchbend range for current microtonal scale value.  (-1 scale value, deal with scale overflow by clipping)
var UpperRange = 0;

function Initialize(){
	var cc = new ControlChange;   /* make a new ControlChange event*/
	cc.channel = 0 /* send all messages to MIDI Channel 0 */

	/* initialize RPN ID for pitch bend range (0000H) */
	cc.number = 101;   /* CC ID for the Registered Parameter Number MSB */
	cc.value = 0;   /* Data for MSB for the RPN ID for pitch bend range*/
	cc.send();    /* set the MSB for the RPN ID for pitch bend */

	cc.number = 100;   /* CC ID for the Registered Parameter Number LSB */
	cc.value = 0;   /* Data for LSB for the RPN ID for pitch bend range*/
	cc.send();    /* set the LSB for the RPN ID for pitch bend range*/

	/* data entry for pitch bend range */
	cc.number = 6;   /* CC ID for the data entry MSB */
	cc.value = 2;   /* Data for MSB for the pitch bend range. This is the range 	value in semitones, 0 to 127. Practically speaking it is not going to be higher 	than 12. 2 is a common default */
	cc.send();    /* set the pitch bend range in semitones */

	cc.number = 38;   /* CC ID for the data entry LSB */
	cc.value = 0;   /* Data for LSB for the pitch bend range. This is the range 	value in cents, 0 to 127. Practically speaking it is not going to be higher than 	50 */
	cc.send();    /* set the LSB for the RPN ID for pitch bend */

	/* Disable data entry until next time. This prevents accidental change to the 	values we just set. */
	/* initialize RPN ID  */
	cc.number = 101;   /* CC ID for the Registered Parameter Number MSB */
	cc.value = 127;   /* Data for MSB for the RPN ID for disable data entry */
	cc.send();    /* set the MSB for the RPN ID for disable data entry*/

	cc.number = 100;   /* CC ID for the Registered Parameter Number LSB */
	cc.value = 127;   /* Data for LSB for the RPN ID for disable data entry */
	cc.send();    /* set the LSB for the RPN ID for disable data entry*/
}

function HandleMIDI(event) {

    switch (event){

        case NoteOn:
            CurrentPitch = scale(event.value);
            SendMicrotone(event);
            break;

        case NoteOff:
            event.value = PitchCenter;
            event.send();
            break;

        case PitchBend:
            ExternalPitchBend = event.value;
            SendPitchbend();
            break;

        default:
            event.send(); // pass all other values

    }
}

function SendPitchBend (){
    // calculate pitchbend

    // send pitchbend
    var pb = new PitchBend;   /* make a new pitch bend event */
    pb.channel = 0 /* send messages to MIDI Channel 0 */ 
    pb.value = 0;   /* set its pitch bend to center position (0). -8192 to 8191. A value of 0 is center  */ 
    pb.send();    /* send the pitch Ben value */
}

function SendMicrotone(event){
    SendPitchBend();
    event.value = PitchCenter;
    note.send();
}

//Program:
//Experiment with Initialize to send messages to Initialize midi pitchbend range to -1.to +1.5 octave (18 semitones). If that does not work, add initial to  processMIDI.
//Use switch toFilter for
//Note on
//	Convert note number to microtonal pitchbend using table
//	Set adjacent pitchbend ranges.
//	Scale external pitchbend value to fit scale using adjacent pitchbend range, add or subtract to table value
//	Send pitchbend data then send note on using center of scale. Always the same note value, but use input velocity.
//Note off
//	Send note off for center of scale, use input velocity.
//Pitchbend
//	Set current pitchbend value global. 
///	Scale based on adjacent pitchbend range
//	Combine with current microtonal value
//	Send pitchbend message with combined value

//Default: Pass all other messages unchanged.
