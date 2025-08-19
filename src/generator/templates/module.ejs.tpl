{{#each sections}}<section id="{{sectionElementId}}" class="fgta5-carousell" data-title="{{sectionTitle}}">
<%- include(`${modulename}/{{sectionName}}.html`) %>
</section>

{{/each}}
