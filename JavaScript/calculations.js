
$( function() {
	var boardSize , player1, player2;

	/*$(function setVariables() {
		if(localStorage.getItem("htmls") !== "" && localStorage.getItem("htmls") !== "{}") {
			//console.log(JSON.parse(localStorage.getItem("htmls")));
			//console.log("haydaaa")
			$("#game-settings").remove();
			drawLastState(JSON.parse(localStorage.getItem("htmls")));
		} else {
			var empty = 0;
			var variables = {};
			$("input").keydown(function(element){
				if($(element.currentTarget).hasClass("error")){
					$(element.currentTarget).removeClass("error")
				}
			});

			$("#game-settings").submit(function(event) {
				$(event.target).find("input").each(function(key,input) {
					if($(input).val() == "") {
						empty++;
						$(input).addClass("error")
					} else {
						variables[$(input).attr("name")] = $(input).val();
					}
					if(empty != 0) {
						//console.log(variables)
						event.preventDefault();
						return false;
					}
				});
				if(empty == 0) {
					$("#game-settings").remove();
					boardSize = variables["board-size"];

					player1 = variables["player1"];
					player2 = variables["player2"];
					draw(parseInt(boardSize));
					initialize();
				}
			});
		}
	});*/

	draw(9);
	initialize();
	var lastState, startIndex, belongedList, placedInto, placedIndex, currentRound = 0;
	var list = [];
	var listSize;
	var classes = {};
	var symbols = {};
	var htmls = {};
	var counter = 0;
	saveLastState();


	function initialize() {
		trackChanges();
		disableCenter();
		indexer();

		$(".connectedSortable").sortable({
			connectWith: ".connectedSortable",
			cancel:".disabled",
			items:"li:not(.cancelled)",
			placeholder:"ui-state-highlight",
			start : function(event, ui) {
				startIndex 	 = $(ui.item).prevAll().length;
				belongedList = $(ui.item).parent().attr("id");
				var value;
				if( $(ui.item).text() == "" ) {
					if(currentRound%2 == 0 ) {
						value = "x";
						$(ui.item).attr("data-sign", -1);
					} else {
						value = "o"
						$(ui.item).attr("data-sign", 1);
					}
					$(ui.item).text(value);
				}
				$(".ui-sortable-helper").remove();
				var items = "";
				$("ul").each(function(key, value) {
					if($(value).attr("id") !== belongedList && (key > 0 && key < listSize-1)) {
						items += "#" + $(value).attr("id") + ",";
					} else {
						if($(value).attr("id") !== belongedList) {
							$(value).find("li").each(function(key,li) {
								if(key !== startIndex){
									$(li).addClass("cancelled");
								}
							})
						}

					}
				});

				var disable = items.substring(0,(items.length)-1);
				//console.log(disable,"disable");

				$(disable).sortable("disable");

				$("#" + belongedList).sortable("refresh");
			},
			stop :  function(event, ui) {
				placedIndex = $(ui.item).prevAll().length;
				placedInto 	= $(ui.item).parent().attr("id");
				if(placedIndex == startIndex && placedInto == belongedList){
					$(".connectedSortable").sortable("enable");
				}
				$("li").each(function(key,li){
					$(li).removeClass("cancelled")
				})
				var result = checkLegality(startIndex, belongedList, placedIndex, placedInto);
				if(result) {
					if (placedInto !== belongedList ) {
						shiftLive(placedInto,placedIndex);
					}
					if(placedIndex == startIndex && placedInto == belongedList) {
						if( $(ui.item).attr("fixed") == null ) {
							$(ui.item).text("");
							$(ui.item).removeAttr("data-sign");
						}
					} else {
						if ( currentRound % 2 == 0 ) {
							disableByRound("o");
						} else {
							disableByRound("x");
						}

						$(ui.item).attr("fixed",true);
						indexer();
						saveLastState();
						checkWinner();
						disableCenter();
						counter = 0;
						$(".current-round span").text(currentRound+1)
						if(currentRound%2==1){
							$("#player-turn").text(player1);
						} else{
							$("#player-turn").text(player2);
						}

						currentRound++;
					}
				} else {
					counter = 0;
					if( $(ui.item).data("fixed") == null ) {
						$(ui.item).text("");
					}
					//$(".connectedSortable").sortable("cancel")
					//console.log("burdan cagirdik")
					drawLastState(JSON.parse(localStorage.getItem("htmls")));
				}
			}
		});
	}

	function disableCenter() {
		$.each($("li"), function(key,element) {
			if($(element).hasClass("center")){
				jQuery(element).removeClass("disabled center");
			}
		});
		$.each($(".connectedSortable"), function(key,element) {
			if(key > 0 && key < listSize-1) {
				$.each($(element).find("li"),function(key,li) {
					if(key > 0 && key < listSize-1 ) {
						jQuery(li).addClass("disabled center");
					} else {
						if(jQuery(li).hasClass("disabled center")){
							jQuery(li).removeClass("disabled center");
						}
					}
				})
			}
		});
	};

	function disableByRound(round) {
		$(".connectedSortable").sortable("destroy")
		$("li").each(function(key,elem){
			if($(elem).hasClass("disabled")){
				$(elem).removeClass("disabled");
			}
		});
		$("li").each(function(key,elem) {
			if($(elem).text() !== "")
			{
				if($(elem).text() != round){
					$(elem).addClass("disabled");
				}
			}

		});
		initialize();
	}

	function draw(size) {
		listSize = size;
		html     = "";

		if(size % 2 !== 0 && size > 1) {
			var $board = $(".board");

			for (var i = 0; i < size; i++) {
				html += `<ul id="sortable${i}" class="connectedSortable" data-place="${i}">`;
				for(var j = 0; j < size; j++) {
					html += `<li id="${j}${i}" class="ui-state-default"></li>`;
				}
				html += "</ul>";
			}

			$board.append(html);

			$board.css({
				top: `calc(50% - (${$board.outerHeight()}px / 2))`,
				left: `calc(50% - (${$board.outerWidth()}px / 2))`
			})
		} else {
			alert("Enter an odd number bigger than 1 for creating game");
		}
	}

	function drawLastState(htmls) {
		//console.log(htmls)
		$(".connectedSortable").remove();

		for(var i = 0; i < listSize; i++ ){
			tmp = `<ul id="sortable${i}" class="connectedSortable" data-place="${i}">`;
			for(var j = 0; j < listSize; j++) {
				tmp += htmls[i][j];
			}
			tmp += "</ul>";
			$(".board").append(tmp);
		}
		initialize();
		disableCenter();
	}

	function checkLegality(firstIndex, firstList, lastIndex, lastList) {
		var listPlace = parseInt($("#" + lastList).attr("data-place"));;
		if ( firstList !==  lastList ) {
			//console.log(listPlace, "list Place");
			if(listPlace !== 0 && listPlace !== listSize-1) {
				return false;
			}
			if (firstIndex !== lastIndex) {
				return false;
			}
		} else if(lastIndex !== 0 && lastIndex !== listSize-1 && lastIndex !== firstIndex){
			return false;
		}
		return true;
	}

	function saveLastState () {
		$(".connectedSortable").each(function(key, ul){
			var list = $(ul).attr("id");
			var elements = [];
			$.each($(ul).find("li"),function(key,li){
				elements[key] = $(li).prop("outerHTML");
			});
			htmls[key] = elements;
		});
		localStorage.setItem("htmls", JSON.stringify(htmls));
		//console.log("state saved!");
	}

	/*function shiftLive(currentList, index) {
		console.clear();
		//console.log("shift calisti");
		var listIndex = parseInt($("#"+currentList).attr("data-place"));
		var belongedListIndex = parseInt($("#"+belongedList).attr("data-place"));
		if (belongedList > placedInto) {
			//console.log("sol")

			for ( var i = 0; i < listSize; i++ ) {
				for ( var j = 0; j < listSize; j++ ) {
			        if ( j == index && i+1 !== listSize) {
		            	var temp = $("#sortable"+ (i) + " li").get(index + 1);
		            	if (belongedListIndex > 0 && belongedListIndex < listSize ) {
		            		if( i !== belongedListIndex ) {
		            			if(index == 0) {
				            		$("#sortable"+ (i+1)).prepend(temp);
				            	}else {
				            		$("#sortable"+ (i+1) + " li").get(index-1).after(temp);
				            	}
		            		}
		            		if(i == belongedListIndex  ){
		            			return true;
		            		}
		            	} else {
		            		$("#sortable"+ (i) + " li").get(j+1).remove();
				            if( "sortable" + (i+1) !== belongedList) {
				            	if(index == 0) {
				            		$("#sortable"+ (i+1)).prepend(temp);
				            	}else {
				            		$("#sortable"+ (i+1) + " li").get(index-1).after(temp);
				            	}
				            } else {
				            	if(index == 0) {
				            		$("#sortable"+ (i+1)).prepend(temp);
				            	} else {
				            		$("#sortable"+ (i+1) + " li").eq(j-1).after(temp);
				            	}
				            }
		            	}
			            break;
			        }
				}
		    }

		} else {
			//console.log("sağ")
			for ( var i = listSize - 1; i > 0; i-- ) {
				for (var j = 0; j < listSize ; j++) {

	            	if (belongedListIndex > 0 && belongedListIndex < listSize ) {
	            		var temp = $("#sortable"+ (i) + " li").get(index+1);
	            		if( i !== belongedListIndex ) {
	            			if(index == 0) {
			            		$("#sortable"+ (i-1)).prepend(temp);
			            	}else {
			            		$("#sortable"+ (i-1) + " li").get(index-1).after(temp);
			            	}
	            		}
	            		if(i == belongedListIndex  ) {
	            			return true;
	            		}
	            	} else {
	            		var temp = $("#sortable"+ (i) + " li").get(index+1);
	            		//console.log(temp)
	            		//$("#sortable"+ (i) + " li").get(j+1).remove();
				         if( "sortable" + (i-1) !== belongedList) {
			            	if(index == 0) {
			            		$("#sortable"+ (i-1)).prepend(temp);
			            	} else {
			            		$("#sortable"+ (i-1) + " li").get(index-1).after(temp);
			            	}
			            } else {
			            	if(index == 0) {
			            		$("#sortable"+ (i-1)).prepend(temp);
			            	} else {
			            		$("#sortable"+ (i-1) + " li").eq(index-1).after(temp);
			            	}
			            }
	            	}
		            break;
				}
		    }
		}
	}*/
/*
	function shiftLive(currentList,belongedListPlace, currentListPlace,placeHolderIndex, placeHolderList ) {
		console.clear()
		var steps = Math.abs(belongedListPlace - currentListPlace);
		if(steps > 0) {
			if( belongedListPlace > currentListPlace ) {
				//console.log("sol")
				var temp1, temp2;
				for(var i = 0; i < steps; i++) {
					if(startIndex == 0) {
						if ( i == 0 ) {
							temp1 = $("#sortable" + i + " li").get(startIndex+ 1);
						}
						//console.log(temp1)
						temp2 = $("#sortable" + (i+1) + " li").get(startIndex);
						if(startIndex == 0) {
							$("#sortable" + (i+1)).prepend(temp1);
							//console.log("prepended : ", temp1)
						} else {
							$("#sortable" + i + " li").get(startIndex-1).after(temp1);
						}
						//console.log(temp1, "TEMP")
						//console.log(temp2,"TEMP1")
						temp1 = temp2;
					}
					else {
						//console.log("burdayım");
						if ( i==0 ) {
							temp1 = $("#sortable" + i + " li").get(startIndex + 1);
							$("#sortable" + i + " li").eq(startIndex+1).remove();
						}
						temp2 = $("#sortable" + (i+1) + " li").get(startIndex);
						$("#sortable" + (i+1) + " li").get(startIndex-1).after(temp1);
						//console.log(temp1, "TEMP")
						//console.log(temp2,"TEMP1")
						temp1 = temp2;
					}
				}
			} else {
				//console.log("sag")
				//console.log(listSize-1,"aksdjlasdasd")
				var temp1, temp2;
				for(var i = listSize-1; i > listSize-1-steps; i--) {
					if(startIndex == 0) {
						//console.log("suan buradayiz")

						//console.log(steps, "steps")
						if ( i == listSize-1 ) {
						temp1 = $("#sortable" + i + " li").get(startIndex + 1); // şurada değişiklik yapılması lazım , step sayısı ve liste idsi karışıklığı
					}
					temp2 = $("#sortable" + (i-1) + " li").get(startIndex);
					if(startIndex == 0) {
						$("#sortable" + (i-1)).prepend(temp1);
					} else {
						$("#sortable" + i + " li").get(startIndex-1).after(temp1);
					}
					//console.log(temp1, "TEMP")
					//console.log(temp2,"TEMP1")
					temp1 = temp2;
				}else {
					//console.log("simdi de burda");
					if ( i == listSize-1) {
						temp1 = $("#sortable" + i + " li").get(startIndex + 1);
						$("#sortable" + i + " li").eq(startIndex+1).remove();
					}
					temp2 = $("#sortable" + (i-1) + " li").get(startIndex);
					$("#sortable" + (i-1) + " li").get(startIndex-1).after(temp1);
					//console.log(temp1, "TEMP")
					//console.log(temp2,"TEMP1")
					temp1 = temp2;
				}
			}
		}
		}
	}
*/


	function indexer() {
		$("ul").each(function(key,ul) {
			$(ul).find("li").each(function(key,li){
				$(li).attr("data-index",key);
			});
		});
	}

	var shiftedElements = []
	function shiftLive(currentList,belongedListPlace, currentListPlace,placeHolderIndex, placeHolderList ) {
		shiftedElements = [];
		var steps = Math.abs(belongedListPlace - currentListPlace);
		if(steps > 0) {
			if( belongedListPlace > currentListPlace ) {
				//console.log("sol")
				var temp1, temp2;
				for(var i = 0; i < steps; i++) {
					if(startIndex == 0) {
						if ( i == 0 ) {
							temp1 = $("#sortable" + i + " [data-index = " + i + "]");
							shiftedElements.push($(temp1).attr("id"));
						}
						temp2 = $("#sortable" + (i+1) + " [data-index = " + startIndex + "]");
						shiftedElements.push($(temp2).attr("id"));
						if(startIndex == 0) {
							$("#sortable" + (i+1)).prepend(temp1);
						} else {
							$("#sortable" + i + " li").get(startIndex-1).after(temp1);
						}
						temp1 = temp2;
					}
					else {
						if ( i == 0 ) {
							temp1 = $("#sortable" + i + " [data-index = " + startIndex + "]");
							shiftedElements.push($(temp1).attr("id"));
							$("#sortable" + i + " [data-index = " + startIndex + "]").remove();
						}
						temp2 = $("#sortable" + (i+1) + " [data-index = " + startIndex + "]");
						shiftedElements.push($(temp2).attr("id"));
						$("#sortable" + (i+1) + " [data-index = " + startIndex  + "]").after(temp1);
						temp1 = temp2;
					}
				}
			} else {
				//console.log("sag")
				var temp1, temp2;
				for(var i = listSize - 1; i > listSize-1-steps; i--) {
					if(startIndex == 0) {
						if ( i == listSize-1 ) {
							temp1 = $("#sortable" + i + " [data-index = " + startIndex + "]");
							shiftedElements.push($(temp1).attr("id"));
						}
						temp2 = $("#sortable" + (i-1) + " [data-index = " + startIndex + "]");
						shiftedElements.push($(temp2).attr("id"));
						if(startIndex == 0) {
							$("#sortable" + (i-1)).prepend(temp1);
						} else {
							$("#sortable" + i + " [data-index = " + (startIndex) + "]").after(temp1);
						}
						temp1 = temp2;
					} else {
						if ( i == listSize-1) {
							temp1 = $("#sortable" + i + " [data-index = " + startIndex + "]");
							shiftedElements.push($(temp1).attr("id"));
							$("#sortable" + i + " [data-index = " + startIndex + "]").remove();
						}
						temp2 = $("#sortable" + (i-1) + " [data-index = " + startIndex + "]");
						shiftedElements.push($(temp2).attr("id"));
						$("#sortable" + (i-1) + " [data-index = " + startIndex + "]").after(temp1);
						temp1 = temp2;
					}
				}
			}
		}
		//shiftedElements.splice(shiftedElements.length-1,1)
		//console.log(shiftedElements," shifted elements")
	}


	/*function revertShift() {
		//console.log("reverting now")
		var board = JSON.parse(localStorage.getItem("htmls"));
		var beforeShift = [];
		$.each(board,function(key, list) {
			$.each(list,function(key,element){
				if(key == startIndex){
					beforeShift.push($.parseHTML(element)[0]["id"]);
				}
			});
		});
		var shifted = shiftedElements;
		//console.log(beforeShift,shiftedElements)
	}*/

	var revert = 0;
	function trackChanges() {
		$(".connectedSortable").on("sortchange", function( event, ui ) {
			var placeHolderList = $(".ui-sortable-placeholder").parent().attr("id");
			var placeHolderIndex = $(".ui-sortable-placeholder").prevAll().length;
			var belongedListPlace = parseInt($("#" + belongedList).attr("data-place"));
			var currentListPlace  = parseInt($("#" + placeHolderList).attr("data-place"));
			//console.log( placeHolderList, belongedList,counter)
			if(placeHolderList !== belongedList && (currentListPlace + 1 == listSize || currentListPlace == 0) ) {
				if(counter == 0) {
					shiftLive(placeHolderList,belongedListPlace,currentListPlace,placeHolderIndex,placeHolderList);
					counter++;
				}
			}

			if(counter !== 0 && placeHolderList == belongedList)	{
				drawLastState(JSON.parse(localStorage.getItem("htmls")));
				counter = 0 ;
			}

		});
	}

	function finishMatch () {
		localStorage.setItem("htmls", "");
		location.reload();
	}

	function checkWinner() {
			//check diagonal
			var temp = 0;
			var collect = [];
			function check() {
				if(Math.abs(temp) == listSize) {
					if(temp < 0) {
						$.each(collect,function(key,element){
							$(element).addClass("glow")
						})
						$(".connectedSortable").sortable("destroy")
						return "win"
					} else {
						$.each(collect,function(key,element){
							$(element).addClass("glow")
						})
						$(".connectedSortable").sortable("destroy")
						return "win"
					}

				} else {
					temp = 0;
				}
			}
			for ( var i = 0; i < listSize; i++ ) {
				var element = $("#sortable"+ (i) + " li").get(i);
				temp += parseInt($(element).attr("data-sign"));
				collect.push(element);
			}
			check();
			collect = [];
			//check row
			for ( var i = 0; i < listSize; i++ ) {
				for ( var j = 0; j < listSize; j++ ) {
					var element = $("#sortable"+ (j) + " li").get(i);
					temp += parseInt($(element).attr("data-sign"));
					collect.push(element);
				}
				check();
				collect = [];
				temp = 0;
			}
			check();//check column
			for ( var i = 0; i < listSize; i++ ) {
				for ( var j = 0; j < listSize; j++ ) {
					var element = $("#sortable"+ (i) + " li").get(j);
					temp += parseInt($(element).attr("data-sign"));
					collect.push(element);
				}
				check();
				collect = [];
			}
		}
	});

