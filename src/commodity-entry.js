import DOMPurify from 'dompurify';
import Handsontable from 'handsontable';
import HyperFormula from 'hyperformula';

// Bring in the initializer logic (adapted to run from this bundle)
// We'll expose a function `initBundledCommodity(root)` on window which
// creates the table.

function createTable(container) {
  const NONE_LABEL = '\u2014 none \u2014';
  const hotHeader = ['Commodity','Dropoff 1','Dropoff 2','Dropoff 3','Dropoff 4','Dropoff 5','SCU Total','Contract Payout','Contract Payout (num)'];
  const commodityNames = Array.from({length:13},()=> '');
  const hotRows = commodityNames.map((name,i)=>{ const rowNum = i+2; return [name,'','','','','',`=SUM(B${rowNum}:F${rowNum})`,'','']; });
  const extraRows = Array.from({length:109},(_,i)=>{ const rowNum = 15 + i; return ['','','','','','',`=SUM(B${rowNum}:F${rowNum})`,'','']; });
  const totalsRow = ['Totals','=SUM(B2:B123)','=SUM(C2:C123)','=SUM(D2:D123)','=SUM(E2:E123)','=SUM(F2:F123)','=SUM(G2:G123)','=SUM(H2:H123)','=SUM(I2:I123)','=SUM(I2:I123)'];
  const hotData = [hotHeader, ...hotRows, ...extraRows, totalsRow];

  const commodityOptions = [
    'AcryliPlex Composite','Audio Visual Equipment','Bioplastic','Carbon-Silk','Construction Materials','Diamond Laminate','DynaFlex','Kopion Horn','Luminalia Gift Box','Marok Gem','Neograph','Omnapoxy','Party Favors','Red Festival Envelope','Ship Ammunition','Souvenirs','Thermalfoam','Year of the Dog Envelope','Year of the Monkey Envelope','Year of the Pig','Year of the Ram Envelope','Year of the Rooster Envelope','Agricium','Agricium Ore','Aluminum','Aluminum Ore','Borase','Borase Ore','Carbon','Cobalt','Copper','Copper Ore','Gold','Gold Ore','Iron','Iron Ore','Mercury','Riccite','Silicon','Stileron','Tin','Titanium','Titanium Ore','Tungsten','Tungsten Ore',"Xa' Pyen","Agricultural Supplies","DCSR2","Ranta Dung","Altruciatoxin","Distilled Spirits","E'tam","Gasping Weevil Eggs","Maze","Neon","Osoian Hides","Revenant Tree Pollen","SLAM","Stims","WiDow","Amioshi Plague","Degnous Root","Golden Medmons","Heart of the Woods","Jumping Limes","Pitambu","Prota","Revenant Pods","Sunset Berries","Ammonia","Argon","Astatine","Chlorine","Fluorine","Helium","Hydrogen","Iodine","Methane","Nitrogen","Partillium","Pressurized Ice","Aphorite","Beryl","Beryl Raw","Bexalite","Bexalite Raw","Corundum","Corundum Raw","Diamond","Diamond Raw","Dolivine","Hadanite","Hephaestanite","Hephaestanite Raw","Janalite","Laranite","Laranite Raw","Potassium","Quantainium","Quantainium Raw","Quartz","Quartz Raw","Taranite","Taranite Raw","Atlasium","Beradom","Dymantium","Feynmaline","Glacosite","Steel","Compboard","Scrap","Fresh Food","Human Food Bars","Processed Food","Inert Materials","Medical Supplies","Recycled Material Composite","Waste"
  ];
  commodityOptions.sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  commodityOptions.unshift('');

  const hot = new Handsontable(container, {
    data: hotData,
    rowHeaders: true,
    colHeaders: true,
    licenseKey: 'non-commercial-and-evaluation',
    width: '100%',
    height: 600,
    stretchH: 'all',
    hiddenColumns: { columns: [4,5,8], indicators:false },
    hiddenRows: { rows: Array.from({length:109},(_,i)=>i+14), indicators:false },
    manualColumnResize: true,
    manualRowResize: true,
    filters: true,
    dropdownMenu: true,
    contextMenu: true,
    readOnly: false,
    comments: true,
    cells: function(row,col){
      const cellProperties = {};
      const isDataRow = row > 0 && row < 123;
      if (col === 0 && isDataRow) {
        cellProperties.editor = 'autocomplete';
        cellProperties.source = function(query, process){ try{ const q=(query||'').toString().toLowerCase(); const matches = commodityOptions.filter(item=>{ if(!item) return true; if(!q) return true; return item.toLowerCase().indexOf(q)!==-1}); const display = matches.map(m => (m===''? NONE_LABEL : m)); process(display.slice()); } catch(e){ process(commodityOptions.map(m=>(m===''? NONE_LABEL : m)).slice()); } };
        cellProperties.strict = true; cellProperties.allowInvalid=false;
        cellProperties.validator = function(value, cb){ const ok = commodityOptions.indexOf(value)!==-1 || value === NONE_LABEL; if (typeof cb === 'function') return cb(ok); return ok; };
        const orig = Handsontable.renderers.TextRenderer; cellProperties.renderer = function(instance, td, row, col, prop, value, cellProps){ orig.apply(this, arguments); if (value === '') td.textContent = NONE_LABEL; };
      }
      if (row === 123) { cellProperties.className='htBold'; cellProperties.readOnly=true; }
      if (row === 0 && (col===0 || col===6 || col===7)) { cellProperties.readOnly=true; }
      if (col === 6) { cellProperties.readOnly=true; }
      if (col === 7) { cellProperties.type='text'; cellProperties.renderer = function(instance, td, row, col, prop, value){ Handsontable.renderers.TextRenderer.apply(this, arguments); var num = Number(value); if(!isNaN(num) && value !== null && value !== '') td.textContent = '$' + num.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}); }; if (row === 123) cellProperties.readOnly = true; }
      if (col === 8) { cellProperties.readOnly = true; }
      return cellProperties;
    },
    dropdownMenu: ['filter_by_condition','filter_by_value','filter_action_bar','freeze_column','freeze_row','remove_row','remove_col','row_above','row_below','col_left','col_right','clear_column','clear_custom_sort','undo','redo','make_read_only','alignment','commentsAddEdit','commentsRemove','mergeCells','unmergeCells','copy','cut','paste'],
    contextMenu: ['row_above','row_below','col_left','col_right','remove_row','remove_col','undo','redo','make_read_only','alignment','commentsAddEdit','commentsRemove','mergeCells','unmergeCells','copy','cut','paste'],
    fixedRowsTop: 1,
    fixedRowsBottom: 1,
    formulas: { engine: HyperFormula },
    allowInsertRow: true, allowInsertColumn: true, allowRemoveRow: true, allowRemoveColumn: true,
    manualColumnFreeze: true, manualRowMove: true, manualColumnMove: true,
    autoColumnSize: true, autoRowSize: true, multiColumnSorting: true, multiRowSorting: true,
    afterOnCellMouseDown: function(event, coords, TD){ const row = coords.row, col = coords.col; const isDataRow = row > 0 && row < 123; if(col===0 && isDataRow){ this.selectCell(row,col); const instance = this; setTimeout(()=>{ try{ const editor = instance.getActiveEditor && instance.getActiveEditor(); if(editor && typeof editor.beginEditing === 'function') editor.beginEditing(); else if(editor && typeof editor.open === 'function') editor.open(); let editableEl = null; if(editor) editableEl = editor.TEXTAREA || editor.textarea || editor.select || editor.selectElement || editor.htEditor || null; if(!editableEl) editableEl = document.activeElement || TD && TD.querySelector && TD.querySelector('input,textarea,select'); if(editableEl) { try{ const ev = new KeyboardEvent('keydown', {key:'ArrowDown', code:'ArrowDown', bubbles:true}); editableEl.dispatchEvent(ev); } catch(e){} } try{ const root = instance.rootElement || instance.rootDocument || document; const caret = root.querySelector && (root.querySelector('.handsontableSelectEditor .caret') || root.querySelector('.htDropdownCaret') || root.querySelector('.htAutocompleteCaret')); if(caret) caret.dispatchEvent(new MouseEvent('mousedown', {bubbles:true})); } catch(e){} } catch(e){} },0); } },
    afterChange: function(changes, source){ if(!changes) return; const instance = this; changes.forEach(([row, prop, oldVal, newVal]) => { try{ if(newVal === NONE_LABEL) instance.setDataAtCell(row, prop, '', 'normalize-none'); } catch(e){} }); }
  });
  container.handsontableInstance = hot;
  return hot;
}

function initBundledCommodity(rootSelector) {
  const root = (typeof rootSelector === 'string') ? document.querySelector(rootSelector) : rootSelector || document.body;
  if (!root) throw new Error('Root not found');
  // create container structure
  const containerWrap = document.createElement('div'); containerWrap.className = 'container';
  containerWrap.innerHTML = `<h2 class="mb-4">Multi Contract Cargo Tracker (Bundled)</h2><div id="hot-container"></div>`;
  root.appendChild(containerWrap);
  const hotContainer = containerWrap.querySelector('#hot-container');
  const hot = createTable(hotContainer);
  // return the instance for programmatic use
  return { root, hot };
}

// expose globally for pages that include the bundle directly
window.initBundledCommodity = initBundledCommodity;

export default initBundledCommodity;
