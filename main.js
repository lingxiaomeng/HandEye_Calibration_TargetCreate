function generateMarkerSvg(width, height, bits) {
    let svg = $('<svg/>').attr({
        viewBox: '0 0 ' + (width + 2) + ' ' + (height + 2),
        xmlns: 'http://www.w3.org/2000/svg',
        'shape-rendering': 'crispEdges' // disable anti-aliasing to avoid little gaps between rects
    });
    // Background rect
    $('<rect/>').attr({
        x: 0,
        y: 0,
        width: width + 2,
        height: height + 2,
        fill: 'black'
    }).appendTo(svg);

    // "Pixels"
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let color = bits[i * height + j] ? 'white' : 'black';
            let pixel = $('<rect/>').attr({
                width: 1,
                height: 1,
                x: j + 1,
                y: i + 1,
                fill: color
            });
            pixel.appendTo(svg);
        }
    }

    return svg;
}

var dict;

function generateArucoMarker(width, height, dictName, id) {
    console.log('Generate ArUco marker ' + dictName + ' ' + id);

    let bytes = dict[dictName][id];
    let bits = [];
    let bitsCount = width * height;

    // Parse marker's bytes
    for (let byte of bytes) {
        let start = bitsCount - bits.length;
        for (let i = Math.min(7, start - 1); i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    return generateMarkerSvg(width, height, bits);
}

var loadDict = $.getJSON('dict.json', function (data) {
    dict = data;
});

$(function () {
    var dictSelect = $('.setup select[name=dict]');
    var markerIdInputFirst = $('.setup input[name=id1]');
    var markerIdInputLast = $('.setup input[name=id2]');
    var sizeInput = $('.setup input[name=size]');
    var xInput = $('.setup input[name=X-size]');
    var yInput = $('.setup input[name=Y-size]');
    var separationInput = $('.setup input[name=separation]');

    function updateMarkers() {
        var markerIdFirst = Number(markerIdInputFirst.val());
        var markerIdLast = Number(markerIdInputLast.val());
        var size = Number(sizeInput.val());
        var x = Number(xInput.val());
        var y = Number(yInput.val());
        var separation = Number(separationInput.val());

        var dictName = dictSelect.val();
        var width = Number(dictSelect.find('option:selected').attr('data-width'));
        var height = Number(dictSelect.find('option:selected').attr('data-height'));


        // Wait until dict data is loaded
        loadDict.then(function () {
            $('#cards').html('');
            // $('#cards').style.grid-template-columns = 'repeat(3, 1fr)';
            // $('#cards').style.grid-template-columns = 'repeat(3, 1fr)';

            for (let i = 0; i < y; i++) {
                for (let j = 0; j < x; j++) {
                    var markerId = markerIdFirst + i * x + j
                    let svg = generateArucoMarker(width, height, dictName, markerId, size);

                    svg.attr({
                        width: size + 'mm',
                        height: size + 'mm'
                    });
                    let marker = $('<div class="card" id="' + (i * x + j) + '"/>').html((svg[0].outerHTML));

                    // marker.style.position = "absolute"
                    // marker.style.left = j*size + "mm"
                    // marker.style.top = i*size + "mm"
                    $('#cards').append(marker);
                    var box = document.getElementById((i * x + j)); // 获取元素对象
                    box.style.position = "absolute"
                    box.style.left = j * (size + separation) + 'mm'; // 设置元素左边距离为50px
                    box.style.top = i * (size + separation) + 'mm'; // 设置元素上边距离为50px
                }

            }
            var cards = document.getElementById("cards"); // 获取元素对象
            cards.style.height = (y*(size + separation)+separation) +'mm'
            cards.style.width = (x*(size + separation)+separation) +'mm'

        })
    }

    updateMarkers();

    dictSelect.change(updateMarkers);
    $('.setup input').on('input', updateMarkers);
});
