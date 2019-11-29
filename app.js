angular.module("expressoesRegulares", []);
angular.module("expressoesRegulares").controller("expressoesControle", function ($scope, $interval, $timeout) {

    $scope.app = "Expressoes Regulares";
    $scope.tableIsEditable = false;

    $scope.simbolAddLeft = "";
    $scope.simbolAddRight = "";

    $scope.estado = "->";
    $scope.execucao = false;

    var stopLoop;

    $scope.fita = []

    let fitaReset = [];

    $scope.styleSection = function (fita) {
        return {
            "width": fita.length * 100,
            "transition": "transform 0.5s;"
        }
    }

    var validaEntradaSimbolo = function (input) {
        if (!input) {
            alert("Informe um simbolo");
            return undefined;
        }
        else if (input.length > 1) {
            alert("Informe apenas um simbolo");
            return undefined;
        }
        return input;
    }

    $scope.getInputString = function (string) {
        $scope.fita = []; //limpa lista
        var fita = [];

        if (string.length > 0) {

            let a = string.charAt(0);
            let b = string.charAt(1);

            if (a + b == "->") {
                fita.push({ simbolo: "->", cursor: true, style: { "left": 0 } });
            } else {
                alert("Simbolo inicial invalido");
                return;
            }

            for (var i = 2; i < string.length; i++) {
                fita.push({ simbolo: string.charAt(i), cursor: false, style: { "left": (i - 1) * 100 } });
            }

            generateRibbon(fita);
        }
    }

    var generateRibbon = function (fita) {
        for (var i = 0; i < fita.length; i++) {
            $scope.fita.push(fita[i]);
        }

    }

    $scope.addLeft = function (fita, simbolAddLeft) {
        if (validaEntradaSimbolo(simbolAddLeft)) {
            $scope.fita.splice(1, 0, { simbolo: simbolAddLeft, cursor: false, style: { "left": 0 } })
            reorderPositionCels(fita)
        }
    }

    $scope.addBlankLeft = function (fita) {
        $scope.fita.splice(1, 0, { simbolo: "_", cursor: false, style: { "left": 0 } })
        reorderPositionCels(fita)
    }

    $scope.addRight = function (fita, simbolAddRight) {
        if (validaEntradaSimbolo(simbolAddRight)) {
            $scope.fita.push({ simbolo: simbolAddRight, cursor: false, style: { "left": 0 } })
            reorderPositionCels(fita)
        }
    }

    $scope.addBlankRight = function (fita) {
        $scope.fita.push({ simbolo: "_", cursor: false, style: { "left": 0 } })
        reorderPositionCels(fita)
    }

    let reorderPositionCels = function (fita) {
        $scope.fita = fita.filter((fita, index) => {
            fita.style.left = index * 100;
            return fita;
        })
    }

    /*Mtethod execute work MT*/
    $scope.play = function (fita, estado, tabela) {

        if(fita.length <= 0){
            alert("Fita não encontrada");
            return;
        }

        $scope.execucao = true;
        fitaReset = angular.copy(fita);

        stopLoop = $interval(function () {
            let celula = headRead($scope.fita);
            var action = culsultActionsTable(celula, $scope.estado, $scope.tabela);
            executeAction(action, $scope.fita);
        }, 1000);

    }

    $scope.stop = function () {
        $interval.cancel(stopLoop);
        $scope.estado = "->";
        stopLoop = undefined;
        $scope.execucao = false;
    };

    $scope.reset = function () {
        if (fitaReset.length > 0) {
            $scope.stop();
            $scope.fita = angular.copy(fitaReset);
        }
    }

    let headRead = function (fita) {
        return fita.filter((fita, index) => {
            return fita.cursor == true;
        })[0];
    }

    let culsultActionsTable = function (celula, estado, tabela) {
        var indexColumnHead = -1;

        for (var i = 0; i < tabela[0].head.length; i++) {
            if (tabela[0].head[i].escrita == celula.simbolo) {
                indexColumnHead = i;
                break;
            }
        }
        for (var i = 0; i < tabela.length; i++) {
            if (tabela[i].estado == estado) {
                return tabela[i].actions[indexColumnHead];
            }
        }
    }

    let executeAction = function (action, fita) {
        var indexCel;
        var directionHead;

        var celModified = fita.filter((fita, index) => {
            if (fita.cursor == true) {
                $scope.estado = action.estado;
                fita.simbolo = action.escrita;
                directionHead = action.diracao;
                indexCel = index;
                fita.cursor = false;
                return fita;
            }
        })[0];

        $scope.fita.splice(indexCel, 1, celModified);

        moveHead(indexCel, directionHead)

        return true;
    }

    let moveHead = function (index, directionHead) {
        if (directionHead == "D") {

            if (index + 1 > $scope.fita.length - 1) {
                $scope.addBlankRight($scope.fita);
            }

            $scope.fita[index + 1].cursor = true;
        } else if (directionHead == "E") {

            if (index == 0) {
                $scope.addBlankLeft($scope.fita);
                $scope.fita[index].cursor = true;
            } else {
                $scope.fita[index - 1].cursor = true;
            }

        } else if (directionHead == "fim" || directionHead == "para") {
            $scope.execucao = false;
            $scope.stop();
            alert("FIM");
            return
        } else {
            alert(directionHead + " -> Simbolo não encontrado");
        }

    }

    $scope.addLine = function (tabela) {
        var columns = []

        for (var i = 0; i < tabela[0].head.length; i++) {
            columns.push(
                { estado: "", escrita: "", diracao: "" }
            );
        }
        var obj = {
            estado: "",
            actions: columns
        }
        tabela.push(obj);
    }

    $scope.removeLine = function (tabela) {
        tabela.splice(tabela.length - 1, 1);
    }

    $scope.addColumn = function (tabela) {

        tabela[0].head.push(
            { escrita: "" }
        );

        for (var i = 1; i <= tabela.length; i++) {
            tabela[i].actions.push(
                { estado: "", escrita: "", diracao: "" }
            );
        }
        tabela.push(obj);
    }

    $scope.styleSizeTable = function (tabela) {

        let size = tabela[0].head.length;

        if (size <= 3 || size == undefined) {
            return {
                "width": 500,
                "transition": "transform 0.5s;"
            }
        } else {
            return {
                "width": size * 150,
                "transition": "transform 0.5s;"
            }
        }
    }


    $scope.removeColumn = function (tabela) {
        tabela[0].head.splice(tabela[0].head.length - 1, 1);

        for (var i = 1; i <= tabela.length; i++) {
            tabela[i].actions.splice(tabela[0].head.length - 1, 1);
        }
        tabela.push(obj);
    }

    $scope.editeTable = function () {
        $scope.tableIsEditable = !$scope.tableIsEditable;
    }



    $scope.exemploSoma = function () {
        $scope.tabela = tabelaSoma;
    }

    $scope.exemploMultiplicacao = function () {
        $scope.tabela = tabelaMultiplicacao;
    }

    $scope.tabelaComparaLetras = function () {
        $scope.tabela = tabelaComparaLetras;
        $scope.string = "->AB"
    }



    var tabelaMultiplicacao = [
        {
            "description": "Est.",
            "head": [
                {
                    "escrita": "*"
                },
                {
                    "escrita": "_"
                },
                {
                    "escrita": "->"
                },
                {
                    "escrita": "A"
                }
            ]
        },
        {
            "estado": "->",
            "actions": [
                {
                    "estado": "->",
                    "escrita": "*",
                    "diracao": "E"
                },
                {
                    "estado": "->",
                    "escrita": "_",
                    "diracao": "E"
                },
                {
                    "estado": "0",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "->",
                    "escrita": "*",
                    "diracao": "E"
                }
            ]
        },
        {
            "estado": "0",
            "actions": [
                {
                    "estado": "1",
                    "escrita": "->",
                    "diracao": "D"
                },
                {
                    "estado": "6",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {

                }
            ]
        },
        {
            "estado": "1",
            "actions": [
                {
                    "estado": "1",
                    "escrita": "*",
                    "diracao": "D"
                },
                {
                    "estado": "2",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "2",
            "actions": [
                {
                    "estado": "3",
                    "escrita": "A",
                    "diracao": "D"
                },
                {
                    "estado": "->",
                    "escrita": "_",
                    "diracao": "E"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "3",
            "actions": [
                {
                    "estado": "3",
                    "escrita": "*",
                    "diracao": "D"
                },
                {
                    "estado": "4",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "4",
            "actions": [
                {
                    "estado": "4",
                    "escrita": "*",
                    "diracao": "D"
                },
                {
                    "estado": "5",
                    "escrita": "*",
                    "diracao": "E"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "5",
            "actions": [
                {
                    "estado": "5",
                    "escrita": "*",
                    "diracao": "E"
                },
                {
                    "estado": "5",
                    "escrita": "_",
                    "diracao": "E"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "2",
                    "escrita": "A",
                    "diracao": "D"
                }
            ]
        },
        {
            "estado": "6",
            "actions": [
                {
                    "estado": "6",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "fim",
                    "escrita": "_",
                    "diracao": "para"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        }
    ];

    $scope.tabela = [
        {
            "description": "Est.",
            "head": [
                {
                    "escrita": ""
                },
                {
                    "escrita": ""
                },
                {
                    "escrita": ""
                }
            ]
        },
        {
            "estado": "",
            "actions": [
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "",
            "actions": [
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {

                }
            ]
        },
        {
            "estado": "",
            "actions": [
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "",
            "actions": [
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        }
    ];



    var tabelaSoma = [
        {
            "description": "Est.",
            "head": [
                {
                    "escrita": "*"
                },
                {
                    "escrita": "_"
                },
                {
                    "escrita": "->"
                }
            ]
        },
        {
            "estado": "->",
            "actions": [
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "0",
                    "escrita": "_",
                    "diracao": "D"
                }
            ]
        },
        {
            "estado": "0",
            "actions": [
                {
                    "estado": "0",
                    "escrita": "*",
                    "diracao": "D"
                },
                {
                    "estado": "1",
                    "escrita": "*",
                    "diracao": "D"
                },
                {

                }
            ]
        },
        {
            "estado": "1",
            "actions": [
                {
                    "estado": "1",
                    "escrita": "*",
                    "diracao": "D"
                },
                {
                    "estado": "2",
                    "escrita": "_",
                    "diracao": "E"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "2",
            "actions": [
                {
                    "estado": "fim",
                    "escrita": "_",
                    "diracao": "para"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        }
    ];



    var tabelaComparaLetras = [
        {
            "description": "Est.",
            "head": [
                {
                    "escrita": "A"
                },
                {
                    "escrita": "B"
                },
                {
                    "escrita": "X"
                },
                {
                    "escrita": "->"
                },
                {
                    "escrita": "_"
                },
                {
                    "escrita": "0"
                }
            ]
        },
        {
            "estado": "->",
            "actions": [
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "0",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "0",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "0",
            "actions": [
                {
                    "estado": "1",
                    "escrita": "X",
                    "diracao": "D"
                },
                {
                    "estado": "2",
                    "escrita": "X",
                    "diracao": "D"
                },
                {
                    "estado": "0",
                    "escrita": "X",
                    "diracao": "D"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "0",
                    "escrita": "_",
                    "diracao": "para"
                },
                {
                    "estado": "0",
                    "escrita": "0",
                    "diracao": "fim"
                }
            ]
        },
        {
            "estado": "1",
            "actions": [
                {
                    "estado": "1",
                    "escrita": "A",
                    "diracao": "D"
                },
                {
                    "estado": "X",
                    "escrita": "X",
                    "diracao": "E"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "1",
                    "escrita": "_",
                    "diracao": "fim"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "2",
            "actions": [
                {
                    "estado": "X",
                    "escrita": "X",
                    "diracao": "E"
                },
                {
                    "estado": "2",
                    "escrita": "B",
                    "diracao": "D"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "2",
                    "escrita": "_",
                    "diracao": "fim"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        },
        {
            "estado": "X",
            "actions": [
                {
                    "estado": "X",
                    "escrita": "A",
                    "diracao": "E"
                },
                {
                    "estado": "X",
                    "escrita": "B",
                    "diracao": "E"
                },
                {
                    "estado": "X",
                    "escrita": "X",
                    "diracao": "E"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                },
                {
                    "estado": "0",
                    "escrita": "_",
                    "diracao": "D"
                },
                {
                    "estado": "",
                    "escrita": "",
                    "diracao": ""
                }
            ]
        }
    ];
});
