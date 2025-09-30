// Externalized initialization for commodity-table.html
// This file runs after Handsontable and supporting libs have loaded.
document.addEventListener('DOMContentLoaded', function() {
  // Define the header row
  const hotHeader = ['Commodity', 'Dropoff 1', 'Dropoff 2', 'Dropoff 3', 'Dropoff 4', 'Dropoff 5', 'SCU Total', 'Contract Payout', 'Contract Payout (num)'];
  // Define empty commodity names for the first 13 rows so the Commodity column starts blank
  const commodityNames = Array.from({length: 13}, () => '');
  // Generate rows 2-14 (1-based, 0-based index 1-13) with commodity names and formulas
  const hotRows = commodityNames.map((name, i) => {
    const rowNum = i + 2; // Excel-style row number
    return [name, '', '', '', '', '', `=SUM(B${rowNum}:F${rowNum})`, '', ''];
  });
  // Generate rows 15-123 (0-based index 14-122) as blank with formula in G
  const extraRows = Array.from({length: 109}, (_, i) => {
    const rowNum = 15 + i;
    return ['', '', '', '', '', '', `=SUM(B${rowNum}:F${rowNum})`, '', ''];
  });
  // Totals row (row 124, 0-based index 123)
  const totalsRow = [
    'Totals',
    '=SUM(B2:B123)',
    '=SUM(C2:C123)',
    '=SUM(D2:D123)',
    '=SUM(E2:E123)',
    '=SUM(F2:F123)',
    '=SUM(G2:G123)',
    '=SUM(H2:H123)',
    '=SUM(I2:I123)',
    '=SUM(I2:I123)'
  ];
  // Combine all rows
  const hotData = [hotHeader, ...hotRows, ...extraRows, totalsRow];
  // Master list of commodity options (centralized so we can sort and add an empty option)
  const commodityOptions = [
    'AcryliPlex Composite', 'Audio Visual Equipment', 'Bioplastic', 'Carbon-Silk', 'Construction Materials',
    'Diamond Laminate', 'DynaFlex', 'Kopion Horn', 'Luminalia Gift Box', 'Marok Gem', 'Neograph', 'Omnapoxy',
    'Party Favors', 'Red Festival Envelope', 'Ship Ammunition', 'Souvenirs', 'Thermalfoam', 'Year of the Dog Envelope',
    'Year of the Monkey Envelope', 'Year of the Pig', 'Year of the Ram Envelope', 'Year of the Rooster Envelope',
    'Agricium', 'Agricium Ore', 'Aluminum', 'Aluminum Ore', 'Borase', 'Borase Ore', 'Carbon', 'Cobalt', 'Copper',
    'Copper Ore', 'Gold', 'Gold Ore', 'Iron', 'Iron Ore', 'Mercury', 'Riccite', 'Silicon', 'Stileron', 'Tin',
    'Titanium', 'Titanium Ore', 'Tungsten', 'Tungsten Ore', "Xa' Pyen", 'Agricultural Supplies', 'DCSR2',
    'Ranta Dung', 'Altruciatoxin', 'Distilled Spirits', "E'tam", 'Gasping Weevil Eggs', 'Maze', 'Neon',
    'Osoian Hides', 'Revenant Tree Pollen', 'SLAM', 'Stims', 'WiDow', 'Amioshi Plague', 'Degnous Root',
    'Golden Medmons', 'Heart of the Woods', 'Jumping Limes', 'Pitambu', 'Prota', 'Revenant Pods', 'Sunset Berries',
    'Ammonia', 'Argon', 'Astatine', 'Chlorine', 'Fluorine', 'Helium', 'Hydrogen', 'Iodine', 'Methane', 'Nitrogen',
    'Partillium', 'Pressurized Ice', 'Aphorite', 'Beryl', 'Beryl Raw', 'Bexalite', 'Bexalite Raw', 'Corundum',
    'Corundum Raw', 'Diamond', 'Diamond Raw', 'Dolivine', 'Hadanite', 'Hephaestanite', 'Hephaestanite Raw',
    'Janalite', 'Laranite', 'Laranite Raw', 'Potassium', 'Quantainium', 'Quantainium Raw', 'Quartz', 'Quartz Raw',
    'Taranite', 'Taranite Raw', 'Atlasium', 'Beradom', 'Dymantium', 'Feynmaline', 'Glacosite', 'Steel', 'Compboard',
    'Scrap', 'Fresh Food', 'Human Food Bars', 'Processed Food', 'Inert Materials', 'Medical Supplies',
    'Recycled Material Composite', 'Waste'
  ];
  // Alphabetize (case-insensitive) and add explicit blank option at top
  commodityOptions.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const NONE_LABEL = '\u2014 none \u2014'; // em-dash none em-dash
  commodityOptions.unshift('');
  const container = document.getElementById('hot-container');
  const hot = new Handsontable(container, {
    data: hotData,
    rowHeaders: true,
    colHeaders: true,
    licenseKey: 'non-commercial-and-evaluation',
    width: '100%',
    height: 600,
    stretchH: 'all',
    hiddenColumns: {
      columns: [4,5,8],
      indicators: false
    },
    hiddenRows: {
      rows: Array.from({length: 109}, (_, i) => i + 14),
      indicators: false
    },
    manualColumnResize: true,
    manualRowResize: true,
    filters: true,
    dropdownMenu: true,
    contextMenu: true,
    readOnly: false,
    comments: true,
    cells: function(row, col) {
      const cellProperties = {};
      const isDataRow = row > 0 && row < 123;
      if (col === 0 && isDataRow) {
        cellProperties.editor = 'autocomplete';
        cellProperties.source = function(query, process) {
          try {
            const q = (query || '').toString().toLowerCase();
            const matches = commodityOptions.filter(item => {
              if (!item) return true;
              if (!q) return true;
              return item.toLowerCase().indexOf(q) !== -1;
            });
            // debug logging removed for production: keep source fast and quiet
            const display = matches.map(m => (m === '' ? NONE_LABEL : m));
            process(display.slice());
          } catch (e) {
            // If the source generation fails, fallback to full list silently
            process(commodityOptions.map(m => (m === '' ? NONE_LABEL : m)).slice());
          }
        };
        cellProperties.strict = true;
        cellProperties.allowInvalid = false;
        cellProperties.validator = function(value, callback) {
          const ok = commodityOptions.indexOf(value) !== -1 || value === NONE_LABEL;
          if (typeof callback === 'function') return callback(ok);
          return ok;
        };
        const originalRenderer = Handsontable.renderers.TextRenderer;
        cellProperties.renderer = function(instance, td, row, col, prop, value, cellProps) {
          originalRenderer.apply(this, arguments);
          if (value === '') td.textContent = NONE_LABEL;
        };
      }
      if (row === 123) { cellProperties.className = 'htBold'; cellProperties.readOnly = true; }
      if (row === 0 && (col === 0 || col === 6 || col === 7)) { cellProperties.readOnly = true; }
      if (col === 6) { cellProperties.readOnly = true; }
      if (col === 7 && isDataRow) {
        cellProperties.type = 'text';
        cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) {
          Handsontable.renderers.TextRenderer.apply(this, arguments);
          td.style.color = '#007bff';
          td.style.fontWeight = 'bold';
          if (!isNaN(value) && value !== null && value !== '') {
            td.textContent = '$' + Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
          }
        };
      }
      if (col === 8) { cellProperties.readOnly = true; }
      return cellProperties;
    },
    dropdownMenu: [
      'filter_by_condition', 'filter_by_value', 'filter_action_bar',
      'freeze_column', 'freeze_row', 'remove_row', 'remove_col',
      'row_above', 'row_below', 'col_left', 'col_right',
      'clear_column', 'clear_custom_sort', 'undo', 'redo',
      'make_read_only', 'alignment', 'commentsAddEdit', 'commentsRemove',
      'mergeCells', 'unmergeCells', 'copy', 'cut', 'paste'
    ],
    contextMenu: [
      'row_above', 'row_below', 'col_left', 'col_right',
      'remove_row', 'remove_col', 'undo', 'redo',
      'make_read_only', 'alignment', 'commentsAddEdit', 'commentsRemove',
      'mergeCells', 'unmergeCells', 'copy', 'cut', 'paste'
    ],
    fixedRowsTop: 1,
    fixedRowsBottom: 1,
    formulas: { engine: HyperFormula },
    allowInsertRow: true,
    allowInsertColumn: true,
    allowRemoveRow: true,
    allowRemoveColumn: true,
    manualColumnFreeze: true,
    manualRowMove: true,
    manualColumnMove: true,
    autoColumnSize: true,
    autoRowSize: true,
    multiColumnSorting: true,
    multiRowSorting: true,
    afterOnCellMouseDown: function(event, coords, TD) {
      const row = coords.row, col = coords.col;
      const isDataRow = row > 0 && row < 123;
      if (col === 0 && isDataRow) {
        this.selectCell(row, col);
        const instance = this;
        setTimeout(() => {
          try {
            const editor = instance.getActiveEditor && instance.getActiveEditor();
            try {
                // editor logging removed to avoid noisy console output
            } catch (e) { /* ignore editor logging failures to avoid noisy console output */ }
            if (editor && typeof editor.beginEditing === 'function') { editor.beginEditing(); }
            else if (editor && typeof editor.open === 'function') { editor.open(); }
            let editableEl = null;
            if (editor) editableEl = editor.TEXTAREA || editor.textarea || editor.select || editor.selectElement || editor.htEditor || null;
            if (!editableEl) editableEl = document.activeElement || TD && TD.querySelector && TD.querySelector('input,textarea,select');
            if (editableEl) {
              try { const ev = new KeyboardEvent('keydown', {key: 'ArrowDown', code: 'ArrowDown', bubbles: true}); editableEl.dispatchEvent(ev); } catch (e) {}
            }
            try {
              const root = instance.rootElement || instance.rootDocument || document;
              const caret = root.querySelector && (root.querySelector('.handsontableSelectEditor .caret') || root.querySelector('.htDropdownCaret') || root.querySelector('.htAutocompleteCaret'));
              if (caret) caret.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
            } catch (e) {}
          } catch (e) {}
        }, 0);
      }
    },
    afterChange: function(changes, source) {
      if (!changes) return;
      const instance = this;
      changes.forEach(([row, prop, oldVal, newVal]) => {
        try {
          if (newVal === NONE_LABEL) {
            instance.setDataAtCell(row, prop, '', 'normalize-none');
          }
        } catch (e) {}
      });
    }
  });
  container.handsontableInstance = hot;
  // Reveal the wrapper now that Handsontable is initialized to avoid FOUC
  try {
    var wrapper = document.querySelector('.hot-responsive-wrapper.hot-hidden-until-ready');
    if (wrapper) wrapper.classList.remove('hot-hidden-until-ready');
  } catch (e) {}
  // Ensure the rest of the page is revealed only after critical initialization.
  function revealWhenReady() {
    try {
      var body = document.body;
      if (body && body.classList.contains('fouc-hidden')) body.classList.remove('fouc-hidden');
    } catch (e) {}
    try {
      document.dispatchEvent(new Event('hot-ready'));
    } catch (e) {
      var evt = document.createEvent('Event'); evt.initEvent('hot-ready', true, true); document.dispatchEvent(evt);
    }
  }
  if (document.readyState === 'complete') {
    revealWhenReady();
  } else {
    window.addEventListener('load', revealWhenReady, { once: true });
    // Also set a safety timer in case load doesn't fire promptly
    setTimeout(revealWhenReady, 3000);
  }
});
