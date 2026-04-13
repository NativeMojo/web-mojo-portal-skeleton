# Mustache Template Cheat Sheet

web-mojo uses Mustache templates. The View instance IS the template context,
so any property on `this` (including `this.model`) is available.

## Variables

```html
{{name}}                          <!-- escaped output -->
{{{htmlContent}}}                 <!-- raw HTML (triple braces) -->
{{model.first_name}}              <!-- model property -->
{{model.getDisplayName}}          <!-- model helper method -->
```

## Conditionals

```html
<!-- IMPORTANT: use |bool for boolean checks -->
{{#model.is_active|bool}}
  <span class="badge bg-success">Active</span>
{{/model.is_active|bool}}

{{^model.is_active|bool}}
  <span class="badge bg-secondary">Inactive</span>
{{/model.is_active|bool}}

<!-- Without |bool, Mustache treats the value as an array and iterates -->
```

## Formatters (pipe syntax)

```html
{{model.created|datetime}}             <!-- Apr 12, 2026 3:45 PM -->
{{model.created|datetime_tz}}          <!-- Apr 12, 2026 3:45 PM EST -->
{{model.created|date}}                 <!-- Apr 12, 2026 -->
{{model.created|date:'YYYY-MM-DD'}}   <!-- 2026-04-12 (custom format, note quotes) -->
{{model.created|relative}}             <!-- 2 hours ago -->
{{model.created|epoch|datetime}}       <!-- chain: epoch timestamp → datetime -->

{{model.name|upper}}                   <!-- JOHN DOE -->
{{model.name|lower}}                   <!-- john doe -->
{{model.name|truncate(30)}}            <!-- John Doe... (if longer than 30) -->
{{model.name|default('Unknown')}}      <!-- Unknown (if empty/null) -->

{{model.amount|currency}}              <!-- $12.50 (expects value in cents) -->
{{model.score|number}}                 <!-- 1,234 -->
{{model.ratio|percent}}                <!-- 85% -->

{{model.status|badge}}                 <!-- <span class="badge">status</span> -->
```

## Iteration

```html
{{#items}}
  <div>{{name}} - {{email}}</div>
{{/items}}

<!-- With index -->
{{#items}}
  <div>{{_index}}: {{name}}</div>
{{/items}}
```

## Child View Containers

```html
<!-- Parent template creates a slot -->
<div data-container="my-chart"></div>

<!-- In onInit(), add a child view targeting that container -->
this.myChart = new SomeView({ containerId: 'my-chart' });
this.addChild(this.myChart);
```

## Action Buttons

```html
<!-- data-action maps to onAction* handler methods -->
<button data-action="save">Save</button>       <!-- → onActionSave(event, element) -->
<button data-action="deleteItem">Delete</button> <!-- → onActionDeleteItem(event, element) -->

<!-- NEVER put data-action on form elements (input, select, textarea) -->
<!-- Use buttons inside forms instead -->
```

## Bootstrap Grid in Templates

```html
<div class="row">
  <div class="col-lg-6 col-12">Left column</div>
  <div class="col-lg-6 col-12">Right column</div>
</div>
```

## Common Badge Patterns

```html
<!-- Dynamic badge color from model helper -->
<span class="badge bg-{{model.getStatusBadge}}">
  {{model.status|upper}}
</span>

<!-- Static badges -->
<span class="badge bg-success">Active</span>
<span class="badge bg-warning">Pending</span>
<span class="badge bg-danger">Failed</span>
<span class="badge bg-secondary">Unknown</span>
```
