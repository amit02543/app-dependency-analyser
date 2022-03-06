const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {exec} = require('child_process');
const XLSX = require('xlsx');
const formidable = require('formidable');
const app = express();

var elems = [];
var finalResults = {};

app.use(express.json());
app.use(express.static("express"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/styles', express.static(__dirname + '/node_modules/'));
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/express/index.html'));
})

app.post('/find', (req, res) => {
  var url = req.body.url;

  elems = getPluginDetails(url);

  elems
    .then(val => res.send(val))
    .catch(err => { console.log(err); res.send(err); })
})

app.post('/upload', (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    var f = files[Object.keys(files)[0]];
    var wb = XLSX.readFile(f.path);
    const worksheet = wb.sheet[wb.SheetNames[0]];
    const urls = [];


    for(let z in worksheet) {
      if(z.toString()[0] === 'A') {
        let cellValue = worksheet[z].v;
        if(cellValue.indexOf('http') === 0) {
          urls.push(worksheet[z].v);
        }
      }
    }


    promises = urls.map( url => {
      return getPluginDetails(url).catch(e => e);
    })


    Promise
      .all(promises)
      .then(values => {
        for(var i = 0; i < values.length; i++) {
          var tempValue = values[i];
          var key = Object.keys(tempValue);
          var value = tempValue['${key}'];

          finalResults[`${key}`] = value;
        }

        res.send(finalResults);
      })
      .catch(e => {
        var key = Object.keys(e);
        var value = e[`${key}`];
        finalResults[`${key}`] = value;

        res.send(finalResults);
      })

  })

})


const getPluginDetails = url => {
  var elems = [];
  var urlResults = {};

  return new Promise((reject, resolve) => {
    exec(`stacks-cli ${url}`, (error, stdout, stderr) => {
      if(error) {
        urlResults[`${url}`] = error.message;
        reject(urlResults);
      }

      if(stderr) {
        urlResults[`${url}`] = stderr.message;
        reject(urlResults);
      }

      var rows = stdout.split('\n');

      rows.forEach((row, index) => {
        if(row.indexOf('|') > 0) {
          var cols = row.split('|');
          cols.forEach((col, index) => {
            elems.push(col.trim());
          });
        }
      });

      urlResults[`${url}`] = elems.splice(4);

      resolve(urlResults);
    })
  })
}


const server = http.createServer(app);
const port = 3000;
server.listen(port);
console.debug('Server listening on port ' + port);
