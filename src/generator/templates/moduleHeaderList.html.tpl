<div class="search-container">
	<div id="{{modulePart}}-pnl_search" class="search-parameters">
		<input id="{{modulePart}}-txt_searchtext" fgta5-component="Textbox" placeholder="search" autocomplete="off" spellcheck="false" binding="searchtext">
	</div>
	<button id="{{modulePart}}-btn_gridload">Load</button>
</div>

<table id="{{modulePart}}-tbl" fgta5-component="Gridview">
	<thead>
		<tr data-header key="{{section.primaryKey}}">
			<th autonumber>No</th>{{#each fields}}
			{{columnDefinition}}{{/each}}
		</tr>
	</thead>
</table>



<div class="footer-buttons-container">
	<div></div>
	<div>
		<button id="{{modulePart}}-btn_new" data-action="userHeader-new" data-sectionsource="{{modulePart}}-section">New</button>
	</div>
	<div></div>
</div>
