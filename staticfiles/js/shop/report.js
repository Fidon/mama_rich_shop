$(function () {
    $("#reports_menu_btn").click();

    // tabs
    $("#container .sale_info ul li a").click(function (e) { 
        e.preventDefault();
        var tab_id = $(this).attr('href').replace('#','');
        $("#container .sale_info .tab_container .tab_div").each(function () {
            if (($(this).is(':visible')) && ($(this).attr('id') !== tab_id)) {
                $(this).css('display','none');
                $('#'+tab_id).fadeIn('slow');
            }
        });
    });
    
    var CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    function generate_errorsms(status, sms) {
        return `<div class="alert alert-${status ? 'success' : 'danger'} alert-dismissible fade show px-2 m-0 d-block w-100"><i class='fas fa-${status ? 'check' : 'exclamation'}-circle'></i> ${sms} <button type="button" class="btn-close d-inline-block" data-bs-dismiss="alert"></button></div>`;
    }
    
    function get_dates(dt, div) {
        var mindate, maxdate, dt_start, dt_end = "";
        if (div == 'pay') {
            mindate = $('#paymin_date').val();
            maxdate = $('#paymax_date').val();
        } else {
            mindate = $('#min_date').val();
            maxdate = $('#max_date').val();
        }
        if (mindate) dt_start = mindate + ' 00:00:00.000000';
        if (maxdate) dt_end = maxdate + ' 23:59:59.999999';
        return (dt === 0) ? dt_start : dt_end;
    }

    function clear_dates() {
        $('#min_date').val('');
        $('#max_date').val('');
        $('#paymin_date').val('');
        $('#paymax_date').val('');
    }

    function format_row(d) {
        let row_contents = ``;
        let items = d.items;
        items.forEach(item => {
            row_contents += `<div class="d-block w-100 float-start text-start my-1 px-2">` +
            `<span class="d-inline-block px-1">${item.count}.</span>` +
            `<span class="d-inline-block px-1 mx-1">${item.names}</span>` +
            `<span class="d-inline-block px-1 mx-1">${item.price} (${item.qty})</span>` +
            `<span class="d-inline-block px-1">= &nbsp; ${item.total}</span>` +
            `</div>`;
        });
        return row_contents;
    }

    function formatCurrency(num) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TZS';
    };

    $("#reports_table thead tr").clone(true).attr('class','filters').appendTo('#reports_table thead');
    var reports_table = $("#reports_table").DataTable({
        fixedHeader: true,
        processing: true,
        serverSide: true,
        ajax: {
            url: $("#sale_report_url").val(),
            type: "POST",
            data: function (d) {
                d.start_date = get_dates(0, 'reg');
                d.end_date = get_dates(1, 'reg');
                d.paydate_start = get_dates(0, 'pay');
                d.paydate_end = get_dates(1, 'pay');
            },
            dataType: 'json',
            headers: { 'X-CSRFToken': CSRF_TOKEN },
            dataSrc: function (json) {
                var tableFooter = $('#reports_table tfoot');
                $(tableFooter).find('tr').eq(1).find('th').eq(5).html(formatCurrency(json.grand_total));
                return json.data;
            },
        },
        columns: [
            {
                className: 'dt-control text-success',
                data: null,
                defaultContent: `<i class='fas fa-circle-chevron-right'></i>`
            },
            { data: 'count' },
            { data: 'saledate' },
            { data: 'user' },
            { data: 'customer' },
            { data: 'amount' },
            { data: 'paytype' },
            { data: 'paidstatus' },
            { data: 'paydate' },
            { data: 'action' },
        ],
        order: [[2, 'desc']],
        paging: true,
        lengthMenu: [[10, 20, 40, 50, 100, -1], [10, 20, 40, 50, 100, "All"]],
        pageLength: 10,
        lengthChange: true,
        autoWidth: true,
        searching: true,
        bInfo: true,
        bSort: true,
        orderCellsTop: true,
        dom: "lBfrtip",
        columnDefs: [{
            targets: [0, 1, 9],
            orderable: false,
        },
        {
            targets: 3,
            createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                var cell_content = `<a href="${rowData.user_info}" class="text-color1">${rowData.user}</a>`;
                if (rowData.user_info == "") cell_content = rowData.user;
                $(cell).attr('class', 'ellipsis text-start');
                $(cell).html(cell_content);
            }
        },
        {
            targets: 4,
            createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).attr('class', 'ellipsis text-start');
            }
        },
        {
            targets: 5,
            createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).attr('class', 'text-end pe-2');
            }
        },
        {
            targets: 6,
            createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).attr('class', 'text-start');
            }
        },
        {
            targets: 7,
            createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                if (rowData.paidstatus == 'Yes') {
                    $(cell).attr('class', 'text-success');
                } else {
                    $(cell).attr('class', 'text-danger');
                }
            }
        },
        {
            targets: 9,
            className: 'align-middle text-nowrap text-center',
            createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                var cell_content = `<a href="${rowData.sale_info}" class="btn btn-color1 text-white btn-sm">View</a>`;
                $(cell).html(cell_content);
            }
        }],
        buttons: [
            { // Copy button
                extend: "copy",
                text: "<i class='fas fa-clone'></i>",
                className: "btn btn-color1 text-white",
                titleAttr: "Copy",
                title: "Sales report - ShopApp",
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                }
            },
            { // PDF button
                extend: "pdf",
                text: "<i class='fas fa-file-pdf'></i>",
                className: "btn btn-color1 text-white",
                titleAttr: "Export to PDF",
                title: "Sales report - ShopApp",
                filename: 'sales-report',
                orientation: 'landscape',
                pageSize: 'A4',
                footer: true,
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8],
                    search: 'applied',
                    order: 'applied'
                },
                tableHeader: {
                    alignment: "center"
                },
                customize: function(doc) {
                    doc.styles.tableHeader.alignment = "center";
                    doc.styles.tableBodyOdd.alignment = "center";
                    doc.styles.tableBodyEven.alignment = "center";
                    doc.styles.tableHeader.fontSize = 7;
                    doc.defaultStyle.fontSize = 6;
                    doc.content[1].table.widths = Array(doc.content[1].table.body[1].length + 1).join('*').split('');

                    var body = doc.content[1].table.body;
                    for (i = 1; i < body.length; i++) {
                        doc.content[1].table.body[i][1].margin = [3, 0, 0, 0];
                        doc.content[1].table.body[i][1].alignment = 'center';
                        doc.content[1].table.body[i][2].alignment = 'center';
                        doc.content[1].table.body[i][3].alignment = 'left';
                        doc.content[1].table.body[i][4].alignment = 'left';
                        doc.content[1].table.body[i][5].alignment = 'right';
                        doc.content[1].table.body[i][6].alignment = 'left';
                        doc.content[1].table.body[i][7].alignment = 'center';
                        doc.content[1].table.body[i][8].alignment = 'center';
                        doc.content[1].table.body[i][8].margin = [0, 0, 3, 0];

                        for (let j = 0; j < body[i].length; j++) {
                            body[i][j].style = "vertical-align: middle;";
                        }
                    }
                }
            },
            { // Export to excel button
                extend: "excel",
                text: "<i class='fas fa-file-excel'></i>",
                className: "btn btn-color1 text-white",
                titleAttr: "Export to Excel",
                title: "Sales report - ShopApp",
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                }
            },
            { // Print button
                extend: "print",
                text: "<i class='fas fa-print'></i>",
                className: "btn btn-color1 text-white",
                title: "Sales report - ShopApp",
                orientation: 'landscape',
                pageSize: 'A4',
                titleAttr: "Print",
                footer: true,
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8],
                    search: 'applied',
                    order: 'applied'
                },
                tableHeader: {
                    alignment: "center"
                },
                customize: function (win) {
                    $(win.document.body).css("font-size","11pt");
                    $(win.document.body).find("table").addClass("compact").css("font-size","inherit");
                }
            }
        ],
        footerCallback: function (row, data, start, end, display) {
            var api = this.api(), data;
            var intVal = function ( i ) {
                return typeof i === 'string' ?
                    i.replace(/[\s,]/g, '')
                     .replace(/TZS/g, '')
                     * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };
            var salesTotal = api
                .column(5)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

            $(api.column(5).footer()).html(formatCurrency(salesTotal));
        },
        initComplete: function() {
            var api = this.api();
            api.columns([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).eq(0).each(function (colIdx) {
                var cell = $(".filters th").eq($(api.column(colIdx).header()).index());
                if (colIdx == 2) {
                    var calendar =`<button type="button" class="btn btn-sm btn-color1 text-white" data-bs-toggle="modal" data-bs-target="#date_filter_modal"><i class="fas fa-calendar-alt"></i></button>`;
                    cell.html(calendar);
                    $("#date_clear").on("click", function() {
                        $("#min_date").val("");
                        $("#max_date").val("");
                    });
                    $("#date_filter_btn").on("click", function() {
                        reports_table.draw();
                    });
                } else if (colIdx == 8) {
                    var calendar =`<button type="button" class="btn btn-sm btn-color1 text-white" data-bs-toggle="modal" data-bs-target="#paydate_filter_modal"><i class="fas fa-calendar-alt"></i></button>`;
                    cell.html(calendar);
                    $("#paydate_clear").on("click", function() {
                        $("#paymin_date").val("");
                        $("#paymax_date").val("");
                    });
                    $("#paydate_filter_btn").on("click", function() {
                        reports_table.draw();
                    });
                } else if (colIdx == 6) {
                    var select = document.createElement("select");
                    select.className = "select-filter text-color6";
                    select.innerHTML = `<option value="">All</option>` +
                    `<option value="Cash">Cash</option>` +
                    `<option value="Credit">Credit</option>`;
                    cell.html(select);

                    $(select).on("change", function() {
                        api.column(colIdx).search($(this).val()).draw();
                    });
                } else if (colIdx == 7) {
                    var select = document.createElement("select");
                    select.className = "select-filter text-color6";
                    select.innerHTML = `<option value="">All</option>` +
                    `<option value="Yes">Paid</option>` +
                    `<option value="No">Unpaid</option>`;
                    cell.html(select);

                    $(select).on("change", function() {
                        api.column(colIdx).search($(this).val()).draw();
                    });
                } else if (colIdx == 0 || colIdx == 1 || colIdx == 9) {
                    cell.html("");
                } else {
                    $(cell).html("<input type='text' class='text-color6' placeholder='Filter..'/>");
                    $("input", $(".filters th").eq($(api.column(colIdx).header()).index()))
                    .off("keyup change").on("keyup change", function(e) {
                        e.stopPropagation();
                        $(this).attr('title', $(this).val());
                        var regexr = "{search}";
                        var cursorPosition = this.selectionStart;
                        api.column(colIdx).search(
                            this.value != '' ? regexr.replace('{search}', this.value) : '',
                            this.value != '',
                            this.value == ''
                            ).draw();
                        $(this).focus()[0].setSelectionRange(cursorPosition, cursorPosition);
                    });
                }
            });
        }
    });

    reports_table.on('click', 'td.dt-control', function (e) {
        let tr = e.target.closest('tr');
        let row = reports_table.row(tr);
        let td = ($(e.target).is('#reports_table tr td')) ? $(e.target) : $(e.target).parent();
        if (row.child.isShown()) {
            row.child.hide();
            td.removeClass('text-danger').addClass('text-success');
            td.html(`<i class='fas fa-circle-chevron-right'></i>`);
        } else {
            row.child(format_row(row.data()), 'bg-white').show();
            td.removeClass('text-success').addClass('text-danger');
            td.html(`<i class='fas fa-circle-chevron-down'></i>`);
        }
    });

    $("#sales_search").keyup(function() {
        reports_table.search($(this).val()).draw();
    });

    $("#sales_filter_clear").click(function (e) {
        e.preventDefault();
        $("#sales_search").val('');
        clear_dates();
        reports_table.search('').draw();
    });

    document.addEventListener('click', e => {
        var clicked = $(e.target);
        if (clicked.is('#sale_items_table tr td button') || clicked.is('#sale_items_table tr td button i')) {
            e.preventDefault();
            var itemNames = clicked.is('#sale_items_table tr td button') ? clicked.attr('id').split('_')[1] : clicked.parent().attr('id').split('_')[1];
            $('#sale_item_id').val(itemNames);
            $('#delete_item_modal').modal('show');
        } else if (clicked.is('#confirm_item_btn')) {
            var formData = new FormData();
            formData.append('item_remove', parseInt($('#sale_item_id').val()));

            $.ajax({
                type: 'POST',
                url: $('#sales_actions_url').val(),
                data: formData,
                dataType: 'json',
                contentType: false,
                processData: false,
                headers: {
                    'X-CSRFToken': CSRF_TOKEN
                },
                beforeSend: function() {
                    $("#cancel_item_btn").removeClass('d-inline-block').addClass('d-none');
                    $("#confirm_item_btn").html("<i class='fas fa-spinner fa-pulse'></i>").attr('type', 'button');
                },
                success: function(response) {
                    $("#cancel_item_btn").removeClass('d-none').addClass('d-inline-block');
                    if (response.success) {
                        if (response.items == 0) {
                            window.location.replace(response.sales_page);
                        } else {
                            $("#confirm_item_btn").removeClass('d-inline-block').addClass('d-none');
                            $("#delete_item_modal .formsms").html(generate_errorsms(response.success, response.sms));
                            location.reload();
                        }
                    } else {
                        $("#confirm_item_btn").html(`<i class="fas fa-check-circle"></i> Yes`).attr('type', 'submit');
                        $("#delete_item_modal .formsms").html(generate_errorsms(response.success, response.sms));
                    }
                },
                error: function(xhr, status, error) {
                    $("#cancel_item_btn").removeClass('d-none').addClass('d-inline-block');
                    $("#confirm_item_btn").html(`<i class="fas fa-check-circle"></i> Yes`).attr('type', 'submit');
                    $("#delete_item_modal .formsms").html(generate_errorsms(false, "Failed to delete item, reload & try again"));
                }
            });
        } else if (clicked.is('#confirm_delete_btn')) {
            var formData = new FormData();
            formData.append('sales_delete', parseInt($('#sales_info_id').val()));

            $.ajax({
                type: 'POST',
                url: $('#sales_actions_url').val(),
                data: formData,
                dataType: 'json',
                contentType: false,
                processData: false,
                headers: {
                    'X-CSRFToken': CSRF_TOKEN
                },
                beforeSend: function() {
                    $("#cancel_delete_btn").removeClass('d-inline-block').addClass('d-none');
                    $("#confirm_delete_btn").html("<i class='fas fa-spinner fa-pulse'></i>").attr('type', 'button');
                },
                success: function(response) {
                    $("#cancel_delete_btn").removeClass('d-none').addClass('d-inline-block');
                    if (response.success) {
                        window.location.replace(response.sales_page);
                    } else {
                        $("#confirm_delete_btn").html(`<i class="fas fa-check-circle"></i> Yes`).attr('type', 'submit');
                        $("#confirm_delete_modal .formsms").html(generate_errorsms(response.success, response.sms));
                    }
                },
                error: function(xhr, status, error) {
                    $("#cancel_delete_btn").removeClass('d-none').addClass('d-inline-block');
                    $("#confirm_delete_btn").html(`<i class="fas fa-check-circle"></i> Yes`).attr('type', 'submit');
                    $("#confirm_delete_modal .formsms").html(generate_errorsms(false, "Failed to delete item, reload & try again"));
                }
            });
        } else if (clicked.is('#confirm_paid_btn')) {
            var formData = new FormData();
            formData.append('sales_paid', parseInt($('#sales_info_id').val()));

            $.ajax({
                type: 'POST',
                url: $('#sales_actions_url').val(),
                data: formData,
                dataType: 'json',
                contentType: false,
                processData: false,
                headers: {
                    'X-CSRFToken': CSRF_TOKEN
                },
                beforeSend: function() {
                    $("#cancel_paid_btn").removeClass('d-inline-block').addClass('d-none');
                    $("#confirm_paid_btn").html("<i class='fas fa-spinner fa-pulse'></i>").attr('type', 'button');
                },
                success: function(response) {
                    $("#cancel_paid_btn").removeClass('d-none').addClass('d-inline-block');
                    if (response.success) {
                        $("#confirm_paid_btn").removeClass('d-inline-block').addClass('d-none');
                        $("#paid_modal .formsms").html(generate_errorsms(response.success, response.sms));
                        location.reload();
                    } else {
                        $("#confirm_paid_btn").html(`<i class="fas fa-check-circle"></i> Continue`).attr('type', 'submit');
                        $("#paid_modal .formsms").html(generate_errorsms(response.success, response.sms));
                    }
                },
                error: function(xhr, status, error) {
                    $("#cancel_paid_btn").removeClass('d-none').addClass('d-inline-block');
                    $("#confirm_paid_btn").html(`<i class="fas fa-check-circle"></i> Continue`).attr('type', 'submit');
                    $("#paid_modal .formsms").html(generate_errorsms(false, "Failed to delete item, reload & try again"));
                }
            });
        }
    });
});