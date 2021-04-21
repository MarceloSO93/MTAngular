angular.module("expressoesRegulares", []);
angular.module("expressoesRegulares").controller("expressoesControle", function ($scope, $interval, $timeout) {

    $scope.app = "Vamos manipular imagens uhuuuuulllll!!!!!!!!!!";

    $scope.ctrlBtns = {
        original: false,
        grayscale: false,
        invertede: false,
        varinha: false,
    }

    var collHoveredColor = document.getElementById('hovered-color');
    var collSelectedColor = document.getElementById('selected-color');


    $scope.styleSection = function (fita) {
        return {
            "width": fita.length * 100,
            "transition": "transform 0.5s;"
        }
    }

    $scope.pixel

    var img = new Image();
    img.crossOrigin = 'anonymous';
    // img.src = 'https://media.istockphoto.com/photos/happy-family-ride-in-the-car-picture-id1015452646';
    img.src = 'https://media.istockphoto.com/photos/crazy-looking-black-and-white-border-collie-dog-say-looking-intently-picture-id1213516345';


    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');


    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        img.style.display = 'none';
    };


    var invert = function () {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            data[i] = 255 + data[i];     // red
            data[i + 1] = 255 - data[i + 1]; // green
            data[i + 2] = 255 - data[i + 2]; // blue
        }
        ctx.putImageData(imageData, 0, 0);
    };

    var grayscale = function () {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        ctx.putImageData(imageData, 0, 0);
    };

    var original = function () {
        ctx.drawImage(img, 0, 0);
    };


    $scope.pecentual = 0;

    var calculaVariacaoRGB = function (valorRGB) {
        
        var variacaoRGB = Math.round( ($scope.pecentual * 255 ) / 100 );
        var menor = 0;
        var maior = 255;

        if(variacaoRGB < valorRGB)
            menor = valorRGB - variacaoRGB

        if((valorRGB + variacaoRGB) < 255 ) 
            maior = valorRGB + variacaoRGB

        return variacaoRGB = {maior: maior, menor: menor}

    }

    var executaVariacaoRGB = function (pixelBase, corAtual) {
        
        var variacao = calculaVariacaoRGB(pixelBase)
        
        if(corAtual >= variacao.menor && corAtual <= variacao.maior) 
            return true
        else 
            return false
    }


    var efeitoVarinha = function (pixelBase) {

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        var red = new Array();
        var green = new Array();
        var blue = new Array();
        var alpha = new Array();

        // Leia a imagem e faça alterações rapidamente enquanto ela é lida
        for (i = 0; i < data.length; i += 4) {
            
          red[i] = imgData.data[i];
          if ( executaVariacaoRGB(pixelBase.R, red[i] ) ) red[i] = pixelBase.R;

          green[i] = imgData.data[i+1];
          if ( executaVariacaoRGB(pixelBase.G, green[i] ) ) green[i] = pixelBase.G;

          blue[i] = imgData.data[i+2];
          if ( executaVariacaoRGB(pixelBase.B, blue[i] ) ) blue[i] = pixelBase.B;

          alpha[i] = imgData.data[i+3]; // Again, no change
        } 
      
        // Escreva a imagem de volta para a tela
        for (i = 0; i < data.length; i += 4)  
        {
          imgData.data[i] = red[i];
          imgData.data[i+1] = green[i];
          imgData.data[i+2] = blue[i]; 
          imgData.data[i+3] = alpha[i];   
        } 
      
        ctx.putImageData(imgData, 0, 0);
    };

    function pick(event, destination) {
        var x = event.layerX;
        var y = event.layerY;

        var pixel = ctx.getImageData(x, y, 1, 1);

        var data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        destination.style.background = rgba;
        destination.textContent = rgba;

        return { R: data[0], G: data[1], B: data[2], A: data[3] / 255 }
    }

    // canvas.addEventListener('click', function (event) {
    //     pick(event, collSelectedColor);
    // });
    canvas.addEventListener('mousemove', function (event) {
        pick(event, collHoveredColor);
    });
    canvas.addEventListener('mouseout', function (event) {
        collHoveredColor.style.background = "rgb(255, 255, 255)";
    });
    canvas.addEventListener('click', function (event) {
        var rgba = pick(event, collSelectedColor)

        if ($scope.ctrlBtns.varinha) {
            efeitoVarinha(rgba)
        }
    });


    //Ação dos botoes
    $scope.setOriginal = function (booleano) {
        $scope.ctrlBtns.original = !booleano;
        $scope.ctrlBtns.grayscale = false;
        $scope.ctrlBtns.invertede = false;
        $scope.ctrlBtns.varinha = false;

        if ($scope.ctrlBtns.original) {
            original();
        }
    }


    $scope.setGrayscale = function (booleano) {
        $scope.ctrlBtns.original = false;
        $scope.ctrlBtns.grayscale = !booleano;
        $scope.ctrlBtns.invertede = false;
        $scope.ctrlBtns.varinha = false;

        if ($scope.ctrlBtns.grayscale) {
            grayscale();
        }
    }

    $scope.setInvertede = function (booleano) {
        $scope.ctrlBtns.original = false;
        $scope.ctrlBtns.grayscale = false;
        $scope.ctrlBtns.invertede = !booleano;
        $scope.ctrlBtns.varinha = false;

        if ($scope.ctrlBtns.invertede) {
            invert();
        }
    }

    $scope.setVarinha = function (booleano) {
        $scope.ctrlBtns.original = false;
        $scope.ctrlBtns.grayscale = false;
        $scope.ctrlBtns.invertede = false;
        $scope.ctrlBtns.varinha = !booleano;
    }



});
