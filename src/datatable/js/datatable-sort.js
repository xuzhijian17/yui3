//TODO: break out into own component
var //getClassName = Y.ClassNameManager.getClassName,
    COMPARE = Y.ArraySort.compare,

    //DATATABLE = "datatable",
    ASC = "asc",
    DESC = "desc",
    //CLASS_ASC = getClassName(DATATABLE, "asc"),
    //CLASS_DESC = getClassName(DATATABLE, "desc"),
    //CLASS_SORTABLE = getClassName(DATATABLE, "sortable"),

    TEMPLATE_TH_LINK = '<a class="{link_class}" title="{link_title}" href="{link_href}">{value}</a>';


function RecordsetSort(field, desc, sorter) {
    RecordsetSort.superclass.constructor.apply(this, arguments);
}

Y.mix(RecordsetSort, {
    NS: "sort",

    NAME: "recordsetSort",

    ATTRS: {
        dt: {
        },

        defaultSorter: {
            value: function(recA, recB, field, desc) {
                var sorted = COMPARE(recA.getValue(field), recB.getValue(field), desc);
                if(sorted === 0) {
                    return COMPARE(recA.get("id"), recB.get("id"), desc);
                }
                else {
                    return sorted;
                }
            }
        }
    }
});

Y.extend(RecordsetSort, Y.Plugin.Base, {
    initializer: function(config) {
        this.addTarget(this.get("dt"));
        this.publish("sort", {defaultFn: Y.bind("_defSortFn", this)});
    },

    destructor: function(config) {
    },

    _defSortFn: function(e) {
        this.get("host").get("records").sort(function(a, b) {return (e.sorter)(a, b, e.field, e.desc);});
    },

    sort: function(field, desc, sorter) {
        this.fire("sort", {field:field, desc: desc, sorter: sorter|| this.get("defaultSorter")});
    },

    custom: function() {
        alert("sort custom");
    },

    // force asc
    asc: function() {
        alert("sort asc");
    },

    // force desc
    desc: function() {
        alert("sort desc");
    },

    // force reverse
    reverse: function() {
        alert("sort reverse");
    }
});

Y.namespace("Plugin").RecordsetSort = RecordsetSort;




function DataTableSort() {
    DataTableSort.superclass.constructor.apply(this, arguments);
}

Y.mix(DataTableSort, {
    NS: "sort",

    NAME: "dataTableSort",

    ATTRS: {
        sortedBy: {
            value: null
        }
    }
});

Y.extend(DataTableSort, Y.Plugin.Base, {
    thLinkTemplate: TEMPLATE_TH_LINK,

    initializer: function(config) {
        var dt = this.get("host");
        dt.get("recordset").plug(RecordsetSort, {dt: dt});
        
        //TODO: Don't use hrefs - use tab/arrow/enter
        //this.doBefore("_getThNodeMarkup", this._beforeGetThNodeMarkup);

        // Attach click handlers
        dt.on("theadCellClick", this._onEventSortColumn);

        // Attach UI hooks
        dt.after("recordsetSort:sort", function() {
            dt._uiSetRecordset(dt.get("recordset"));
        });
        dt.after("sortedByChangeEvent", function() {
            alert('ok');
        });

        //TODO
        //dt.after("recordset:mutation", function() {//reset sortedBy});
        
        //TODO
        //add Column sortFn ATTR
    },

    /*_beforeGetThNodeMarkup: function(o, column) {
        if(column.get("sortable")) {
            o.link_class = "foo";
            o.link_title = "bar";
            o.link_href = "bat";
            o.value = Y.substitute(this.thLinkTemplate, o);
        }
    },*/

    _onEventSortColumn: function(e) {
        e.halt();
        var column = this.get("columnset").get("hash")[e.target.get("id")],
            field = column.get("field"),
            prevSortedBy = this.get("sortedBy"),
            dir = (prevSortedBy &&
                prevSortedBy.field === field &&
                prevSortedBy.dir === ASC) ? DESC : ASC,
            sorter = column.get("sortFn");
        this.get("recordset").sort.sort(field, dir === DESC, sorter);
        this.set("sortedBy", {field: field, dir: dir});
    }
});

Y.namespace("Plugin").DataTableSort = DataTableSort;



