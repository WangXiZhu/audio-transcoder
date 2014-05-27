/**
 * Here's a clone of the popular "wav2mp3" program, but using node-lame and
 * node-wav.
 */

var fs = require('fs');
var lame = require('lame');
var wav = require('wav');
var minimist = require('minimist');
var path = require('path');

var minimistOptions = {
    alias: {
        d: ['dir', 'directory', 'target-dir'],
        o: ['output', 'output-file'],
        b: ['bitrate'],
        t: ['tags']
    },
    default: {
        d: './',
        o: false,
        b: 320,
        t: true
    },
    boolean: ['t']
};

var opts = minimist(process.argv.slice(2), minimistOptions);

console.dir(opts);
var inputFiles = opts['_']
var outfileName = opts['o'];
var targetDir = opts['d'];
var bitrate = opts['b'];
var useTags = opts['t'];

if (inputFiles.length <= 0) {
    console.error('Usage:');
    console.error('  Encode FLAC to MP3:');
    console.error('    $ %s <infile.flac> -b <bitrate> -d <output-directory> -t', process.argv.join(' '));
    process.exit(1);
}

console.log('Input files:', inputFiles);
var infile,
    basenameInfile,
    outfile,
    inputStream,
    outputStream,
    ext,
    wavReader;

wavReader = new wav.Reader();

for (var idx in inputFiles) {
    infile = inputFiles[idx];
    basenameInfile = path.basename(infile, path.extname(infile)); // test/test.wav => test.mp3
    targetFilename = outfileName === false ? (basenameInfile + '.mp3') : outfileName;
    console.log('target dir: ' + targetDir);
    console.log('targetFilename: ' + targetFilename);
    outfile = path.join(targetDir, targetFilename);
    console.log('Infile ' + idx + ': ' + infile);
    console.log('Outfile: ' + outfile);
    inputStream = fs.createReadStream(infile);
    outputStream = fs.createWriteStream(outfile);

    // we have to wait for the "format" event before we can start encoding
    wavReader.on('format', onFormat);

    // and start transferring the data
    inputStream.pipe(wavReader);
}

// process.exit(0);

function onFormat (format) {
  console.error('WAV format: %j', format);
  // encoding the wave file into an MP3 is as simple as calling pipe()
  format.bitRate = opts.bitrate;
  var encoder = new lame.Encoder(format);
  wavReader.pipe(encoder).pipe(outputStream);
}


//
// if (process.stdin.isTTY && !filename) {
//   // print help
//   console.error('Usage:');
//   console.error('  encode a wav file:');
//   console.error('    $ %s <infile.wav> <outfile.mp3>', process.argv.join(' '));
//   console.error('  or encode a wav from stdin:');
//   console.error('    $ cat song.wav | %s | mpg123 -', process.argv.join(' '));
//   process.exit(1);
// }

// first figure out if we're encoding from a filename, or from stdin
// var input;
// var output;
// if (filename) {
//   var outfile = process.argv[3];
//   if (!outfile) {
//     console.error('FATAL: must specify an output mp3 file!');
//     process.exit(1);
//   }
//   console.error('encoding %j', filename);
//   console.error('to %j', outfile);
//   input = fs.createReadStream(filename);
//   output = fs.createWriteStream(outfile);
// } else {
//   input = process.stdin;
//   output = process.stdout;
// }
//
// // start reading the WAV file from the input
// var reader = new wav.Reader();
//
// // we have to wait for the "format" event before we can start encoding
// reader.on('format', onFormat);
//
// // and start transferring the data
// input.pipe(reader);
//
// function onFormat (format) {
//   console.error('WAV format: %j', format);
//
//   // encoding the wave file into an MP3 is as simple as calling pipe()
//   format.bitRate = 320;
//   var encoder = new lame.Encoder(format);
//   reader.pipe(encoder).pipe(output);
// }
