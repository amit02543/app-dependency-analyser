$(document).ready(() => {
  $("#searchBtn").click((e) => {
    e.preventDefault();

    var url = $("#search").val();
    console.log("Url: ", url);

    if("" == url) {
      $("#search").addClass("is-invalid");
    } else {
      $("#search").removeClass("is-invalid");
      $("tbody").empty();
      $("#spinner").removeClass("d-done");
      disableAllFields();

      $.ajax({
        method: "POST",
        url: "find",
        data: {url: url}
      })
      .done((values) => {
        addTableRows(values);
        enableAllFields();
      })
      .fail(e => {
        alert("Error: ", e);
        enableAllFields();
        $("#download").removeClass("visible").addClass("invisible");
      });

    }

  });


  $("#fileUploadForm").submit(e => {
    e.preventDefault();

    var fd = new FormData();
    var files = $("#file")[0].files[0];

    if(files.name.indexOf(".xlsx") === -1) {
      $("#file").addClass("is-invalid");
    } else {

      fd.append('file', files);

      $("#file").removeClass("is-invalid");
      $("tbody").empty();
      $("#spinner").removeClass("d-none");
      disableAllFields();

      $.ajax({
        method: 'POST',
        enctype: 'multipart/form-data',
        url: 'upload',
        contentType: false,
        processType: false,
        async: true,
        data: fd
      })
      .done(values => {
        addTableRows(values);
        enableAllFields();
      })
      .fail(e => {
        alert("Error: ", e);
        enableAllFields();
        $("#download").removeClass("visible").addClass("invisible");
      })

    }

  })

})


function addTableRows(allRows) {
  $("#spinner").addClass("d-none");
  var keys = Object.keys(allRows);

  for(var k = 0; k < keys.length; k++) {
    var url = keys[k];
    var values = allRows[`${url}`];
    var rowspan = values.length/4;

    if(values.length === 0) {
      $("tbody").append('<tr class="table-danger"><td>' + url + '</td><td colspan="4">Some error occurred while fetching</td></tr>');
    } else {
      for(var i = 0; i < values.length; i += 4) {
        $("tbody").append('<tr>' + (i == 0 ? '<td rowspan="' + rowspan + '">' + url + '</td>' : '')
        + '<td>' + values[i] + '</td><td>' + values[i + 1] + '</td><td>' + values[i + 2]
        + '</td><td>' + values[i + 3] + '</td></tr>');
      }
    }
  }
}


function downloadFile() {
  var workbook = XLSX.utils.table_to_book(document.getElementById('addTable'));
  return XLSX.writeFile(workbook, 'Application_Dependency_Analyser_Report.xlsx');
}


function disableAllFields() {
  $("#search, #searchBtn, #file, #uploadBtn").prop('disable', true);
  $("#download").removeClass("visible").addClass("invisible");
}


function enableAllFields() {
  $("#search, #searchBtn, #file, #uploadBtn").prop('disable', false);
  $("#download").removeClass("invisible").addClass("visible");
}
