// var allHomeData = {};
var pageLoadTimeoutMs = 6000;

function sleep(timeMs) {
  return new Promise(function(resolve) {
    setTimeout(resolve, timeMs);
  })
}

async function getAllArticlesForSearch(url, listingType, currentWindow) {
  var i = 1;
  while (true) {
    var newHref = url;
    if (i > 1) {
      newHref += `?page=${i}`
    }

    currentWindow.location.href = newHref;
    await sleep(pageLoadTimeoutMs);
    if (currentWindow.$j('body')[0].innerHTML.includes("We can't seem to find the page you're looking for.")) {
      break;
    }

    await getAllArticlesForWindow(newHref, listingType, currentWindow);
    i ++;
  }
}

function alreadyChecked(article, currentWindow) {
  var shortAddress = currentWindow.$j('.details-title a', article)[0].innerHTML.trim();
  console.log("Short address of house is", shortAddress);
  var fullAddresses = Object.keys(allHomeData);

  for (var i = 0; i < fullAddresses.length; i ++) {
    if (fullAddresses[i].includes(shortAddress)) {
      return shortAddress;
    }
  }
  return false;
}

async function getAllArticlesForWindow(listUrl, listingType, currentWindow) {
  var articles = currentWindow.$j('article');
  for (var i = 0; i < articles.length; i ++) {
    var currentArticles = currentWindow.$j('article');

    if (i >= currentArticles.length) {
      break;
    }

    var checked = alreadyChecked(currentArticles[i], currentWindow);
    if (checked) {
      console.log('Page has already been checked', checked);
    }

    currentArticles[i].click();
    await sleep(pageLoadTimeoutMs);

    var homeData = getHomeDataFromPage(currentWindow);
    homeData['listingType'] = listingType;
    allHomeData[homeData.address] = homeData;

    currentWindow.location.href = listUrl;
    await sleep(pageLoadTimeoutMs);
  }
}

function getHomeDataFromPage(currentWindow) {
  var details = {
    'address': currentWindow.$j('.building-title .incognito')[0].innerHTML.trim(),
    'price': parseInt(currentWindow.$j('.price ')[0].innerHTML.split('$')[1].split('<span')[0].replace(',', '').trim()),
    'url': window.location.href,
    'daysOnMarket': parseInt(currentWindow.$j('.Vitals-detailsInfo .Vitals-data')[0].innerHTML.replace(' days', '').trim()),
  };

  var detailsInfo = currentWindow.$j('.details_info');
  var detailCells = currentWindow.$j('.detail_cell', detailsInfo[0]);
  for (var i = 0; i < detailCells.length; i ++) {
    var html = detailCells[i].innerHTML;
    if (html.includes('ft²') && !html.includes('per ft²')) {
      details['squareFeet'] = parseInt(html.replace(' ft²', '').replace(',', '').trim());
    } else if (html.includes(' rooms')) {
      details['rooms'] = parseInt(html.replace(' rooms', '').trim());
    } else if (html.includes(' beds')) {
      details['beds'] = parseInt(html.replace(' beds', '').trim());
    } else if (html.includes(' baths')) {
      details['baths'] = parseInt(html.replace(' baths', '').trim());
    }
  }

  var description = currentWindow.$j('.Description')[0];
  var agentsList = [];
  var agentInfos = currentWindow.$j('.ListingAgents-agentInfoContainer', description);
  for (var i = 0; i < agentInfos.length; i ++) {
    agentsList.push(agentInfos[i].innerHTML.trim());
  }
  details['agentsList'] = agentsList;
  details['description'] = $j('.Description-block', description)[0].innerText;

  var buildingInfo = currentWindow.$j('.BuildingInfo')[0];
  var infoItems = currentWindow.$j('.BuildingInfo-item', buildingInfo);
  details['address'] = currentWindow.$j('a', infoItems[0])[0].innerHTML.trim() + ', ' + currentWindow.$j('span', infoItems[0])[0].innerHTML.replace('&nbsp;', ' ').trim();
  details['homeType'] = currentWindow.$j('span', infoItems[1])[0].innerHTML.split(' in ')[0].trim();
  var infoDetails = currentWindow.$j('.BuildingInfo-detail', infoItems[2]);
  for (var i = 0; i < infoDetails.length; i ++) {
    var infoDetail = infoDetails[i];
    if (infoDetail.innerHTML.includes('Built')) {
      details['yearBuilt'] = parseInt(currentWindow.$j('span', infoDetail)[0].innerHTML.split('span>')[1].replace(' Built', '').trim());
    }
  }

  console.log(details);
  return details;
}



getUrlsWindow =  window.open('https://www.streeteasy.com', 'WindowTitle', 'height=800,width=600');
// getAllArticlesForSearch('https://streeteasy.com/for-sale/east-flatbush/price:400000-900000%7Cbeds%3E=3%7Cbaths%3E=2', 'for sale', getUrlsWindow);
getAllArticlesForSearch('https://streeteasy.com/for-rent/east-flatbush/beds%3E=1', 'for rent', getUrlsWindow);
