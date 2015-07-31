/**
 * Here's a clone of the popular "wav2mp3" program, but using node-lame and
 * node-wav.
 */

var fs = require('fs');
var lame = require('lame');
var wav = require('wav');
var minimist = require('minimist');
var path = require('path');
var navcodec = require('navcodec');


var argvOptions = {
    alias: {
        directory: ['d', 'dir', 'target-dir'],
        output: ['o', 'output-file'],
        bitrate: ['b'],
        tags: ['t']
    },
    default: {
        directory: './',
        output: false,
        bitrate: 320000,
        tags: true
    },
    boolean: ['tags']
};

var audioExtensions = {
    mp3: '.mp3',
    flac: '.flac',
    wav: '.wav'
};

var opts = minimist(process.argv.slice(2), argvOptions);
console.dir(opts);

var inputFiles = opts['_'];
var outputFilename = opts.output;

if (inputFiles.length <= 0) {
    console.error('Usage:');
    console.error('  Encode FLAC to MP3:');
    console.error('    $ %s -b <bitrate> -d <target-directory> <infile1.flac> <infile2.flac> ...', process.argv.join(' '));
    process.exit(1);
}

console.log('Input files:', inputFiles);
var infile,
    infileBasename,
    outfile,
    ext;


for (var idx in inputFiles) {

    (function () {
        infile = inputFiles[idx];
        ext = path.extname(infile);
        infileBasename = path.basename(infile, ext); // test/test.wav => test.mp3
        targetFilename = outputFilename === false ? (infileBasename + audioExtensions.mp3) : outputFilename;
        outfile = path.join(opts.directory, targetFilename);

        console.log('----------');
        console.log('Infile ' + idx + ': ' + infile);
        console.log('Outfile: ' + outfile);

        navcodec.open(infile, null, function (err, media) {
            if (media) {
                media.addOutput(outfile, {
                    audioBitrate: opts.bitrate
                });

                media.transcode(function (err, progress, finished, time) {

                        if (finished) {
                            console.log("Total transcoding time: " + time + "ms");
                        }
                        if (err) {
                            console.log('ERROR', err);
                            throw Error(err);
                        }
                });
            }
        });
    })();

    console.log('*** -----------');
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
