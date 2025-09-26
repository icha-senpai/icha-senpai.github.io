// JS for hide/unhide columns E and F in Handsontable
// Assumes table is initialized as 'hot' and columns E (index 4) and F (index 5)

document.addEventListener('DOMContentLoaded', function() {
  // Wait for Handsontable to be available
  if (typeof Handsontable === 'undefined') return;
  var container = document.getElementById('hot-container');
  if (!container || !container.handsontableInstance) return;
  var hot = container.handsontableInstance;

  // Add buttons
  var btns = document.createElement('div');
  btns.className = 'mb-3';
  btns.innerHTML = `
    <button id="hide-ef" class="btn btn-warning btn-sm me-2">Extra Stops</button>
    <button id="show-ef" class="btn btn-success btn-sm me-2">No Extra Stops</button>
    <button id="toggle-extra-rows" class="btn btn-info btn-sm">Toggle Extra Rows</button>
  `;
  container.parentNode.insertBefore(btns, container);

  document.getElementById('hide-ef').onclick = function() {
  hot.getPlugin('hiddenColumns').showColumns([4,5]);
  hot.render();
  };
  document.getElementById('show-ef').onclick = function() {
  hot.getPlugin('hiddenColumns').hideColumns([4,5]);
  hot.render();
  };
  // Hide/unhide extra rows (rows 15 to 123, 0-based)
  var extraRowsHidden = false;
  document.getElementById('toggle-extra-rows').onclick = function() {
    var hiddenRowsPlugin = hot.getPlugin('hiddenRows');
    var targetRows = Array.from({length: 109}, (_, i) => i + 14);
    if (!extraRowsHidden) {
      hiddenRowsPlugin.hideRows(targetRows);
      extraRowsHidden = true;
    } else {
      hiddenRowsPlugin.showRows(targetRows);
      extraRowsHidden = false;
    }
    hot.render();
  };
});
