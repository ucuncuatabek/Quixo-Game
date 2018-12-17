
$(function() {
	draw(5);
	initialize();
	var lastState, startIndex, belongedList, placedInto, placedIndex, currentRound = 0;
	var list = [];
	var listSize;
	var classes = {};
	var symbols = {};
	var htmls = {};
	var counter = 0;
	function initialize() {
		disableCenter();
		$(".connectedSortable").sortable({
			connectWith: ".connectedSortable",
			cancel:".disabled",
			placeholder: "ui-state-highlight",
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
				var columnsToDisable = [];
				$("ul").each(function(key,value) {
					if($(value).attr("id") !== belongedList) {
						items.push("#" + $(value).attr("id"));
					}
				});
				console.log(items);
				$(items).sortable("disable")
			},
			stop :  function(event, ui) {
				placedIndex = $(ui.item).prevAll().length;
				placedInto 	= $(ui.item).parent().attr("id");
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
						saveLastState();
						checkWinner();
						disableCenter();
						counter = 0;
						$(".current-round span").text(currentRound+1)
						currentRound++;
					}
				} else {
					if( $(ui.item).data("fixed") == null ) {
						$(ui.item).text("");
					}
					$(".connectedSortable").sortable("cancel")
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
		if( size%2 !== 0 && size > 1) {
			for (var i = 0; i < size; i++) {
				tmp = `<ul id="sortable${i}" class="connectedSortable" data-place="${i}">`;
				for(var j = 0; j < size; j++) {
					tmp += `<li id="${j}${i}" class="ui-state-default"></li>`;
				}
				tmp += "</ul>";
				$(".board").append(tmp);
			}
		} else {
			alert("Enter an odd number bigger than 1 for creating game");
		}
	}

	function drawLastState(htmls) {
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
			console.log(listPlace, "list Place");
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
		console.log("state saved!");
	}

	/*function shiftLive(currentList, index) {
		console.clear();
		console.log("shift calisti");
		var listIndex = parseInt($("#"+currentList).attr("data-place"));
		var belongedListIndex = parseInt($("#"+belongedList).attr("data-place"));
		if (belongedList > placedInto) {
			console.log("sol")

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
			console.log("sağ")
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
	            		console.log(temp)
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

	function shiftLive(currentList,belongedListPlace, currentListPlace,placeHolderIndex, placeHolderList ) {
		var steps = Math.abs(belongedListPlace - currentListPlace);
		if( belongedListPlace > currentListPlace ) {
			console.log("sol")
			var temp1, temp2;
			for(var i = 0; i < steps; i++) {
				if(startIndex == 0) {
					if ( i==0 ) {
						temp1 = $("#sortable" + i + " li").get(placeHolderIndex+ 1);
					}
					console.log(temp1)
					temp2 = $("#sortable" + (i+1) + " li").get(placeHolderIndex);
					if(placeHolderIndex == 0) {
						$("#sortable" + (i+1)).prepend(temp1);
						console.log("prepended : ", temp1)
					} else {
						$("#sortable" + i + " li").get(placeHolderIndex-1).after(temp1);
					}
					console.log(temp1, "TEMP")
					console.log(temp2,"TEMP1")
					temp1 = temp2;
				}
				else {
					console.log("burdayım");

					if ( i==0 ) {
						temp1 = $("#sortable" + i + " li").get(placeHolderIndex + 1);
						$("#sortable" + i + " li").eq(startIndex+1).remove();
					}
					temp2 = $("#sortable" + (i+1) + " li").get(placeHolderIndex);
					$("#sortable" + (i+1) + " li").get(placeHolderIndex-1).after(temp1);
					console.log(temp1, "TEMP")
					console.log(temp2,"TEMP1")
					temp1 = temp2;
				}
			}
		} else {
			console.log("sag")
			var temp1, temp2;
			for(var i = steps; i > 0; i--) {
				if(startIndex == 0) {
					if ( i == steps ) {
						temp1 = $("#sortable" + i + " li").get(placeHolderIndex + 1);
						console.log("#sortable" + i + " li","jshdkjadhjkasdl")
					}
					console.log(temp1)
					temp2 = $("#sortable" + (i-1) + " li").get(placeHolderIndex);
					if(placeHolderIndex == 0) {
						$("#sortable" + (i-1)).prepend(temp1);
						console.log("prepended : ", temp1)
					} else {
						$("#sortable" + i + " li").get(placeHolderIndex-1).after(temp1);
					}
					console.log(temp1, "TEMP")
					console.log(temp2,"TEMP1")
					temp1 = temp2;
				}
				else {
					console.log("burdayım");

					if ( i == steps ) {
						temp1 = $("#sortable" + i + " li").get(placeHolderIndex + 1);
						$("#sortable" + i + " li").eq(startIndex+1).remove();
					}
					temp2 = $("#sortable" + (i-1) + " li").get(placeHolderIndex);
					$("#sortable" + (i-1) + " li").get(placeHolderIndex-1).after(temp1);
					console.log(temp1, "TEMP")
					console.log(temp2,"TEMP1")
					temp1 = temp2;
				}
			}
		}
	}

	$(".connectedSortable").on( "sortchange", function( event, ui ) {
		var placeHolderList = $(".ui-sortable-placeholder").parent().attr("id");
		var placeHolderIndex = $(".ui-sortable-placeholder").prevAll().length;
		var belongedListPlace = parseInt($("#" + belongedList).attr("data-place"));
		var currentListPlace  = parseInt($("#" + placeHolderList).attr("data-place"));
		//console.log(placeHolderIndex)
		if(placeHolderList !== belongedList && (currentListPlace+1 == listSize || currentListPlace == 0) && (startIndex == placeHolderIndex)) {
			if(counter == 0) {
				shiftLive(placeHolderList,belongedListPlace,currentListPlace,placeHolderIndex,placeHolderList);
				counter++;
			}
		}
	});


	function finishMatch () {
		localStorage.setItem("htmls", "");
		location.reload();
	}

	function checkWinner() {
		//check diagonal
		var temp = 0;
		function check() {
			if(Math.abs(temp) == listSize) {
				if(temp < 0) {
					alert("Winner Player 1 (X)");
					return "win"
				} else {
					alert("Winner Player 2 (O)");
					return "win"
				}
			} else {
				temp = 0;
			}
		}
		for ( var i = 0; i < listSize; i++ ) {
			var element = $("#sortable"+ (i) + " li").get(i);
			temp += parseInt($(element).attr("data-sign"));
		}
		check();
		//check row
		for ( var i = 0; i < listSize; i++ ) {
			for ( var j = 0; j < listSize; j++ ) {
				var element = $("#sortable"+ (j) + " li").get(i);
				temp += parseInt($(element).attr("data-sign"));
			}
			check();
			temp = 0;
		}
		check();//check column
		for ( var i = 0; i < listSize; i++ ) {
			for ( var j = 0; j < listSize; j++ ) {
				var element = $("#sortable"+ (i) + " li").get(j);
				temp += parseInt($(element).attr("data-sign"));
			}
			check();
		}
	}
});

