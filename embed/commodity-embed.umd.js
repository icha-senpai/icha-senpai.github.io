/* UMD wrapper for commodity-embed - standalone bundle
   Exposes: initCommodityEmbed(rootOrSelector, options) -> Promise<{root, hot}> on window
*/
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.initCommodityEmbed = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  // Inlined module code (standalone). Defines async function initCommodityEmbed and returns it.

  async function initCommodityEmbed(rootOrSelector, options = {}) {
    const cfg = Object.assign({
      rootId: 'icha-commodity-root',
      hotContainerId: 'icha-hot-container',
      toolbarId: 'icha-hot-toolbar',
      ariaId: 'icha-hot-aria-live',
      noneLabel: '\u2014 none \u2014',
      cdn: {
        dompurify: 'https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js',
        handsontable: 'https://cdn.jsdelivr.net/npm/handsontable@13.1.0/dist/handsontable.min.js',
        handsontableCSS: 'https://cdn.jsdelivr.net/npm/handsontable@13.1.0/dist/handsontable.min.css',
        hyperformula: 'https://cdn.jsdelivr.net/npm/hyperformula@2.6.0/dist/hyperformula.full.min.js'
      },
      autoLoadLibs: true
    }, options);

    function byId(id) { return document.getElementById(id); }

    function injectCss(url) {
      if (document.querySelector('link[href="' + url + '"]')) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }

    function injectScopedStyles() {
      if (document.getElementById('icha-embed-styles')) return;
      const css = `
      #${cfg.rootId} { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background:#181818; color:#f3f3f3; padding:1rem; box-sizing:border-box; }
      #${cfg.rootId} .container { max-width:1100px; margin:0 auto; }
      #${cfg.rootId} h2 { color:#fff; margin:0 0 0.5rem 0; font-weight:700; text-shadow: 0 2px 6px rgba(0,0,0,0.7); }
      #${cfg.rootId} #${cfg.toolbarId} { display:flex; justify-content:center; gap:.5rem; margin-bottom:.5rem; }
      #${cfg.rootId} .hot-toolbar-inner { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
      #${cfg.rootId} #${cfg.hotContainerId} { width:100%; min-height:50vh; max-height:900px; height:min(70vh,900px); overflow:auto; background:transparent; }
      #${cfg.rootId} .hot-toggle-icon { margin-right:.35rem; }
      #${cfg.rootId} #icha-hot-toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: 18px; z-index: 1200; pointer-events: none; }
      #${cfg.rootId} .hot-toast-inner { background: rgba(20,20,20,0.9); color:#fff; padding:.6rem 1rem; border-radius:8px; box-shadow: 0 6px 18px rgba(0,0,0,0.6); opacity:0; transition: opacity 220ms ease-in-out, transform 220ms ease-in-out; transform: translateY(6px);} 
      #${cfg.rootId} .hot-toast-inner.show { opacity:1; transform: translateY(0); }
      #${cfg.rootId} .visually-hidden { position:absolute !important; height:1px; width:1px; overflow:hidden; clip:rect(1px,1px,1px,1px); white-space:nowrap; }
    `;
      const style = document.createElement('style');
      style.id = 'icha-embed-styles';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }

    function loadScript(url) {
      return new Promise((resolve, reject) => {
        if (document.querySelector('script[src="' + url + '"]')) { setTimeout(resolve, 50); return; }
        const s = document.createElement('script'); s.src = url; s.async = true;
        s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load ' + url));
        document.head.appendChild(s);
      });
    }

    // Build DOM structure
    function ensureRoot(rootParam) {
      let root;
      if (typeof rootParam === 'string') root = document.querySelector(rootParam) || byId(rootParam) || byId(cfg.rootId);
      else if (rootParam instanceof Element) root = rootParam;
      else root = byId(cfg.rootId) || null;
      if (!root) {
        root = document.createElement('div'); root.id = cfg.rootId; document.body.appendChild(root);
      } else {
        // ensure id present
        if (!root.id) root.id = cfg.rootId;
      }
      root.innerHTML = `
      <div class="container">
        <h2>Multi Contract Cargo Tracker</h2>
        <div id="${cfg.toolbarId}">
          <div class="hot-toolbar-inner">
            <button id="icha-toggle-ef" class="btn" aria-pressed="false">Toggle Extra Stops</button>
            <button id="icha-toggle-extra-rows" class="btn" aria-pressed="false">Toggle Extra Rows</button>
            <span id="${cfg.ariaId}" class="visually-hidden" aria-live="polite" aria-atomic="true"></span>
          </div>
        </div>
        <div id="${cfg.hotContainerId}"></div>
      </div>`;
      return root;
    }

    // The table initializer (extracted; uses Handsontable & HyperFormula)
    function createTable(hotContainer, commodityOptionsOverride) {
      const NONE_LABEL = cfg.noneLabel;
      const hotHeader = ['Commodity', 'Dropoff 1', 'Dropoff 2', 'Dropoff 3', 'Dropoff 4', 'Dropoff 5', 'SCU Total', 'Contract Payout', 'Contract Payout (num)'];
      const commodityNames = Array.from({length: 13}, () => '');
      const hotRows = commodityNames.map((name, i) => {
        const rowNum = i + 2;
        return [name, '', '', '', '', '', `=SUM(B${rowNum}:F${rowNum})`, '', ''];
      });
      const extraRows = Array.from({length: 109}, (_, i) => {
        const rowNum = 15 + i; return ['', '', '', '', '', '', `=SUM(B${rowNum}:F${rowNum})`, '', ''];
      });
      const totalsRow = ['Totals', '=SUM(B2:B123)', '=SUM(C2:C123)', '=SUM(D2:D123)', '=SUM(E2:E123)', '=SUM(F2:F123)', '=SUM(G2:G123)', '=SUM(H2:H123)', '=SUM(I2:I123)', '=SUM(I2:I123)'];
      const hotData = [hotHeader, ...hotRows, ...extraRows, totalsRow];

      const commodityOptions = (commodityOptionsOverride && Array.isArray(commodityOptionsOverride) && commodityOptionsOverride.length) ? commodityOptionsOverride.slice() : [
        'AcryliPlex Composite','Audio Visual Equipment','Bioplastic','Carbon-Silk','Construction Materials','Diamond Laminate','DynaFlex','Kopion Horn','Luminalia Gift Box','Marok Gem','Neograph','Omnapoxy','Party Favors','Red Festival Envelope','Ship Ammunition','Souvenirs','Thermalfoam','Year of the Dog Envelope','Year of the Monkey Envelope','Year of the Pig','Year of the Ram Envelope','Year of the Rooster Envelope','Agricium','Agricium Ore','Aluminum','Aluminum Ore','Borase','Borase Ore','Carbon','Cobalt','Copper','Copper Ore','Gold','Gold Ore','Iron','Iron Ore','Mercury','Riccite','Silicon','Stileron','Tin','Titanium','Titanium Ore','Tungsten','Tungsten Ore',"Xa' Pyen",'Agricultural Supplies','DCSR2','Ranta Dung','Altruciatoxin','Distilled Spirits',"E'tam",'Gasping Weevil Eggs','Maze','Neon','Osoian Hides','Revenant Tree Pollen','SLAM','Stims','WiDow','Amioshi Plague','Degnous Root','Golden Medmons','Heart of the Woods','Jumping Limes','Pitambu','Prota','Revenant Pods','Sunset Berries','Ammonia','Argon','Astatine','Chlorine','Fluorine','Helium','Hydrogen','Iodine','Methane','Nitrogen','Partillium','Pressurized Ice','Aphorite','Beryl','Beryl Raw','Bexalite','Bexalite Raw','Corundum','Corundum Raw','Diamond','Diamond Raw','Dolivine','Hadanite','Hephaestanite','Hephaestanite Raw','Janalite','Laranite','Laranite Raw','Potassium','Quantainium','Quantainium Raw','Quartz','Quartz Raw','Taranite','Taranite Raw','Atlasium','Beradom','Dymantium','Feynmaline','Glacosite','Steel','Compboard','Scrap','Fresh Food','Human Food Bars','Processed Food','Inert Materials','Medical Supplies','Recycled Material Composite','Waste'
      ];
      commodityOptions.sort((a,b)=>a.localeCompare(b, undefined, { sensitivity: 'base' }));
      commodityOptions.unshift('');

      const hot = new Handsontable(hotContainer, {
        data: hotData,
        rowHeaders: true,
        colHeaders: true,
        licenseKey: 'non-commercial-and-evaluation',
        width: '100%',
        height: 600,
        stretchH: 'all',
        hiddenColumns: { columns: [4,5,8], indicators: false },
        hiddenRows: { rows: Array.from({length: 109}, (_, i) => i + 14), indicators: false },
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
                const matches = commodityOptions.filter(item => { if (!item) return true; if (!q) return true; return item.toLowerCase().indexOf(q) !== -1; });
                const display = matches.map(m => (m === '' ? NONE_LABEL : m)); process(display.slice());
              } catch (e) { process(commodityOptions.map(m => (m === '' ? NONE_LABEL : m)).slice()); }
            };
            cellProperties.strict = true; cellProperties.allowInvalid = false;
            cellProperties.validator = function(value, callback) { const ok = commodityOptions.indexOf(value) !== -1 || value === NONE_LABEL; if (typeof callback === 'function') return callback(ok); return ok; };
            const orig = Handsontable.renderers.TextRenderer; cellProperties.renderer = function(instance, td, row, col, prop, value, cellProps){ orig.apply(this, arguments); if (value === '') td.textContent = NONE_LABEL; };
          }
          if (row === 123) { cellProperties.className = 'htBold'; cellProperties.readOnly = true; }
          if (row === 0 && (col === 0 || col === 6 || col === 7)) { cellProperties.readOnly = true; }
          if (col === 6) { cellProperties.readOnly = true; }
          if (col === 7) { cellProperties.type = 'text'; cellProperties.renderer = function(instance, td, row, col, prop, value, cellProperties) { Handsontable.renderers.TextRenderer.apply(this, arguments); var num = Number(value); if (!isNaN(num) && value !== null && value !== '') { td.textContent = '$' + num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}); } }; if (row === 123) { cellProperties.readOnly = true; } }
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
        afterOnCellMouseDown: function(event, coords, TD) {
          const row = coords.row, col = coords.col; const isDataRow = row > 0 && row < 123;
          if (col === 0 && isDataRow) { this.selectCell(row, col); const instance = this; setTimeout(()=>{ try{ const editor = instance.getActiveEditor && instance.getActiveEditor(); if (editor && typeof editor.beginEditing === 'function') editor.beginEditing(); else if (editor && typeof editor.open === 'function') editor.open(); let editableEl = null; if (editor) editableEl = editor.TEXTAREA || editor.textarea || editor.select || editor.selectElement || editor.htEditor || null; if (!editableEl) editableEl = document.activeElement || TD && TD.querySelector && TD.querySelector('input,textarea,select'); if (editableEl) { try { const ev = new KeyboardEvent('keydown', {key: 'ArrowDown', code: 'ArrowDown', bubbles: true}); editableEl.dispatchEvent(ev); } catch (e) {} } try { const rootDoc = instance.rootElement || instance.rootDocument || document; const caret = rootDoc.querySelector && (rootDoc.querySelector('.handsontableSelectEditor .caret') || rootDoc.querySelector('.htDropdownCaret') || rootDoc.querySelector('.htAutocompleteCaret')); if (caret) caret.dispatchEvent(new MouseEvent('mousedown', {bubbles: true})); } catch (e) {} }catch(e){} },0); }
        },
        afterChange: function(changes, source){ if (!changes) return; const instance = this; changes.forEach(([row, prop, oldVal, newVal])=>{ try{ if (newVal === NONE_LABEL) instance.setDataAtCell(row, prop, '', 'normalize-none'); } catch(e){} }); }
      });

      hotContainer.handsontableInstance = hot;
      return hot;
    }

    function initToolbar(root, hotInst) {
      const colToggleBtn = root.querySelector('#icha-toggle-ef');
      const rowsToggleBtn = root.querySelector('#icha-toggle-extra-rows');
      const ariaLive = root.querySelector('#' + cfg.ariaId);

      const hiddenColsSetting = (hotInst.getSettings && hotInst.getSettings().hiddenColumns) || {};
      let extraColsHidden = Array.isArray(hiddenColsSetting.columns) ? hiddenColsSetting.columns.includes(4) || hiddenColsSetting.columns.includes(5) : true;
      let extraRowsHidden = false; try { const hiddenRowsSetting = (hotInst.getSettings && hotInst.getSettings().hiddenRows) || {}; if (Array.isArray(hiddenRowsSetting.rows) && hiddenRowsSetting.rows.length>0) extraRowsHidden = true; } catch(e){}

      function showHotToast(message){ if (!message) return; let toastRoot = document.getElementById('icha-hot-toast'); if (!toastRoot) { toastRoot = document.createElement('div'); toastRoot.id = 'icha-hot-toast'; document.body.appendChild(toastRoot); } toastRoot.innerHTML = ''; const inner = document.createElement('div'); inner.className='hot-toast-inner'; inner.textContent = message; toastRoot.appendChild(inner); requestAnimationFrame(()=>inner.classList.add('show')); setTimeout(()=>inner.classList.remove('show'),1800); setTimeout(()=>{ try{ toastRoot.removeChild(inner); }catch(e){} },2200); }

      function ensureButtonStructure(btn, defaultLabel) { if (!btn) return {icon:null,label:null}; let icon = btn.querySelector('.hot-toggle-icon'); let label = btn.querySelector('.hot-toggle-label'); if (!icon || !label) { const existing = btn.textContent || defaultLabel || ''; btn.innerHTML=''; icon = document.createElement('span'); icon.className='hot-toggle-icon'; label = document.createElement('span'); label.className='hot-toggle-label'; label.textContent = existing.trim(); btn.appendChild(icon); btn.appendChild(label); } return {icon,label}; }

      const colParts = ensureButtonStructure(colToggleBtn, 'Toggle Extra Stops'); const rowParts = ensureButtonStructure(rowsToggleBtn, 'Toggle Extra Rows'); const colIcon = colParts.icon, colLabel = colParts.label; const rowIcon = rowParts.icon, rowLabel = rowParts.label;

      function updateColButton(){ if (!colToggleBtn) return; if (extraColsHidden) { if (colLabel) colLabel.textContent='Show Extra Stops'; colToggleBtn.setAttribute('aria-pressed','false'); if (colIcon) colIcon.textContent='\u25CB'; colToggleBtn.classList.remove('hot-toggle-active'); } else { if (colLabel) colLabel.textContent='Hide Extra Stops'; colToggleBtn.setAttribute('aria-pressed','true'); if (colIcon) colIcon.textContent='\u25CF'; colToggleBtn.classList.add('hot-toggle-active'); } }
      function updateRowsButton(){ if (!rowsToggleBtn) return; if (extraRowsHidden) { if (rowLabel) rowLabel.textContent='Show Extra Rows'; rowsToggleBtn.setAttribute('aria-pressed','false'); if (rowIcon) rowIcon.textContent='\u25CB'; rowsToggleBtn.classList.remove('hot-toggle-active'); } else { if (rowLabel) rowLabel.textContent='Hide Extra Rows'; rowsToggleBtn.setAttribute('aria-pressed','true'); if (rowIcon) rowIcon.textContent='\u25CF'; rowsToggleBtn.classList.add('hot-toggle-active'); } }

      updateColButton(); updateRowsButton();

      if (colToggleBtn) colToggleBtn.addEventListener('click', function(){ try { const plugin = hotInst.getPlugin('hiddenColumns'); if (extraColsHidden) { plugin.showColumns([4,5]); extraColsHidden=false; ariaLive && (ariaLive.textContent='Extra Stops columns are now visible'); } else { plugin.hideColumns([4,5]); extraColsHidden=true; ariaLive && (ariaLive.textContent='Extra Stops columns are now hidden'); } updateColButton(); if (colIcon) colIcon.textContent = extraColsHidden ? '\u25CB' : '\u25CF'; hotInst.render(); showHotToast(extraColsHidden ? 'Extra Stops hidden' : 'Extra Stops visible'); } catch(e){ console.error('toggle cols failed', e); } });

      if (rowsToggleBtn) rowsToggleBtn.addEventListener('click', function(){ try{ const hiddenRowsPlugin = hotInst.getPlugin('hiddenRows'); const targetRows = Array.from({length:109},(_,i)=>i+14); if (!extraRowsHidden) { hiddenRowsPlugin.hideRows(targetRows); extraRowsHidden=true; ariaLive && (ariaLive.textContent='Extra rows are now hidden'); } else { hiddenRowsPlugin.showRows(targetRows); extraRowsHidden=false; ariaLive && (ariaLive.textContent='Extra rows are now visible'); } updateRowsButton(); if (rowIcon) rowIcon.textContent = extraRowsHidden ? '\u25CB' : '\u25CF'; hotInst.render(); showHotToast(extraRowsHidden ? 'Extra rows hidden' : 'Extra rows visible'); } catch(e) { console.error('toggle rows failed', e); } });
    }

    // Bootstrapping
    if (cfg.autoLoadLibs) {
      // inject styles + css
      injectScopedStyles(); injectCss(cfg.cdn.handsontableCSS);
      // load libraries in order: DOMPurify, HyperFormula, Handsontable
      if (typeof DOMPurify === 'undefined') await loadScript(cfg.cdn.dompurify);
      if (typeof HyperFormula === 'undefined') await loadScript(cfg.cdn.hyperformula);
      if (typeof Handsontable === 'undefined') await loadScript(cfg.cdn.handsontable);
      // wait briefly for globals
      for (let i=0;i<40;i++) { if (typeof Handsontable !== 'undefined' && typeof HyperFormula !== 'undefined' && typeof DOMPurify !== 'undefined') break; await new Promise(r=>setTimeout(r,50)); }
      if (typeof Handsontable === 'undefined' || typeof HyperFormula === 'undefined' || typeof DOMPurify === 'undefined') throw new Error('Required libraries failed to load');
    } else {
      injectScopedStyles();
    }

    const root = ensureRoot(rootOrSelector || options.root || cfg.rootId);
    const hotContainer = root.querySelector('#' + cfg.hotContainerId);
    const hotInstance = createTable(hotContainer, options.commodityOptions);
    initToolbar(root, hotInstance);

    // expose instance on root
    root.handsontableInstance = hotInstance;
    return { root, hot: hotInstance };
  }

  return initCommodityEmbed;
}));
