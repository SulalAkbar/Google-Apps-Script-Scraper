function SCRAPER() {

  var formData = {

            


};

  var options = {

     "method" : "GET",
     'payload' : formData,

     "headers" : {

              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "Accept-Encoding": "gzip, deflate, br",
              //"Accept-Language": "en-US,en;q=0.9",
              //"Cache-Control": "max-age=0",
              "Connection": "keep-alive",
              //"Content-Length": "177",
              "Content-Type": "application/x-www-form-urlencoded",
              //"Cookie": "",
              //"Host": "",
             // "Origin": "",
              //"Referer": "",
              //"sec-ch-ua": '"Chromium";v="88", "Google Chrome";v="88", ";Not\\A\"Brand";v="99"',
              //"sec-ch-ua-mobile": "?1",
              //"Sec-Fetch-Dest": "document",
              //"Sec-Fetch-Mode": "navigate",
              //"Sec-Fetch-Site": "same-origin",
              //"Sec-Fetch-User": "?1",
              //"Upgrade-Insecure-Requests": "1",
              "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Mobile Safari/537.36",
     
     }
   }
  
  url = ""

  var response = UrlFetchApp.fetch(url, options);

  
  var list_of_details_post_links = []
  var list_of_result_pages_links = []

  //List will contain all detail post
  list_of_details_post_links = find_detail_post_links(response);

  //List will contain all result pages links
  list_of_result_pages_links = find_result_page_links(response);

  //console.log(list_of_result_pages_links)
//#*#
  for (var i = 0;i < list_of_result_pages_links.length;i++){

      response = get_response_for_result_link(list_of_result_pages_links[i]);

      var links_list = find_detail_post_links(response);
      console.log("Extracting Detail Post Links :",links_list.length)
      list_of_details_post_links = list_of_details_post_links.concat(links_list);

      
      var wait = Math.floor((Math.random() * 4) + 1);
      Utilities.sleep(wait*1000);
      console.log('Wait for :',wait)

  }

  console.log('Total Links Found :',list_of_details_post_links.length);
  // console.log(list_of_details_post_links);


  //Clearing Contents of sheets and adding Labels
    var sheet = SpreadsheetApp.getActiveSheet()
    sheet.clear()

    

  //
  for(var i=0;i<list_of_details_post_links.length;i++){

        url = ''+list_of_details_post_links[i]
        

        response = get_response_detail_post(url)

        console.log(i,'#########',list_of_details_post_links[i]);
        var data_recv = extract_data(response);

        //Now Putting Recieved Data to Google Sheet
        insert_row(data_recv);

        console.log(data_recv);
        var wait = Math.floor((Math.random() * 4) + 1);
        Utilities.sleep(wait*1000);


  }//#*#

   

  
  //Finding Detail Post Links ##########



  //#####################################################
  //Finding Links to All Result Pages on first search


  //#####################################################



  //console.log($result.find('tr[class=pair]'))

//  var keys = Object.keys($pages)
//   console.log(keys)

  

}

//Function for finding Result Page Links
function find_result_page_links(response){

    
    var content = response.getContentText()

    //console.log(content);
    var $ = Cheerio.load(content);
    
    var $result = $("#resultats");
    var result_pages_links = [];                      
    var $pages = $result.find('div[class="pagination top"] > p > a' ).each(function (index, element) {
    result_pages_links.push($(element).attr('href'));
  });



    //result_pages_links = result_pages_links.slice(0,result_pages_links.length-2);

    // for(var i = 0;i<result_pages_links.length;i++){

    //   console.log(result_pages_links[i]);

    // }
    
    var last_page_url = result_pages_links[result_pages_links.length-1]
    var default_url = result_pages_links[0];

    var last_page_number = last_page_url.slice(last_page_url.length-2,last_page_url.length)

    if (last_page_number[0] == '='){
      console.log('Its Sign')
      last_page_number = last_page_number[1] 

    }
    else{
      console.log('Nothing')
    }
    console.log(default_url);
    console.log(typeof Number(last_page_number))

    var final_result_page_links = []
    for(var i=2;i<=last_page_number;i++){

      final_result_page_links.push(default_url.slice(0,default_url.length-1)+i)
      //console.log(default_url.slice(0,default_url.length-1)+i)
    }

    console.log(final_result_page_links)

    //Finding Last Page of Search Result
    // var response2 = get_response_for_result_link(result_pages_links[result_pages_links.length-1])
    // var content2 = response.getContentText()

    // //console.log(content);
    // var $2 = Cheerio.load(content2);
    
    // var $result2 = $2("#resultats");
    // var $end_page = $result2.find('div[class="pagination top"] > p' )//> span[class="passif"]

    //console.log($end_page.text());



     //console.log(result_pages_links.length)
     //console.log(result_pages_links);

    return final_result_page_links;

}

//Function for finding detail Post Links
function find_detail_post_links(response){

    var content = response.getContentText()

    //console.log(content);
    var $ = Cheerio.load(content);
    var $result = $("#resultats");

    var $result1 = $result.find('tr[class=pair]')
    var $result2 = $result.find('tr[class=impair]')


    var detail_post_links = []

    
    //Finding Links to DetailPost
    $result1.find('a').each(function (index, element) {
    detail_post_links.push($(element).attr('href'));
    })

    $result2.find('a').each(function (index, element) {
    detail_post_links.push($(element).attr('href'));
  });

  return detail_post_links;

}

//Function for getting Result Pages
function get_response_for_result_link(url){

    var options = {

     "method" : "GET",

     "headers" : {

          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "max-age=0",
          "Connection": "keep-alive",
          "sec-ch-ua": '"Chromium";v="88", "Google Chrome";v="88", ";Not\\A\"Brand";v="99"',
          "sec-ch-ua-mobile": "?1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Mobile Safari/537.36",
     
     }
   }
  
  var url = ''+url;
  //console.log('URL IN GETPAGE',url)

  var response = UrlFetchApp.fetch(url, options);

  console.log(response.getResponseCode())

  return response;

}

//Function for getting Detail Post Page Response
function get_response_detail_post(url){

    var options = {

     "method" : "GET",

     "headers" : {

          'Cookie': ''
     
     }
   }
  
  

  var response = UrlFetchApp.fetch(url, options);

  console.log(response.getResponseCode())

  return response;

}

function extract_data(response){

    //response = get_response_detail_post('')

    var content = response.getContentText()

    //console.log(content);
    var $ = Cheerio.load(content);

    var $result = $('#contenu');
    
    
    var Typeannonce = $result.find('div[id="annonce"] > h3').text()

    var Bc_publication = $result.find('div[id="annonce"] > p > em').text()
    var N = $result.find('div[id="annonce"] > dl').children()[1].children[0].data
    var RCS = $result.find('div[id="annonce"] > dl').children()[3].children[0].data
    var Denomination = $result.find('div[id="annonce"] > dl').children()[5].children[0].data
    var Forme = $result.find('div[id="annonce"] > dl').children()[7].children[0].data
    //var Capital = $result.find('div[id="annonce"] > dl').children()[9].children[0].data
    //var Administration = $result.find('div[id="annonce"] > dl').children()[11].children[0].data
    //var Adresse = $result.find('div[id="annonce"] > dl').children()[13].children[0].data
    //var Etablissement =  $result.find('div[id="annonce"] > dl').children()[15].children[1].children[5].children[0].data
    //var Origine_du_fond = $result.find('div[id="annonce"] > dl').children()[15].children[1].children[11].children[0].data
    //var Activite = $result.find('div[id="annonce"] > dl').children()[15].children[1].children[17].children[0].data

    //var Adresse_de_l_etablissement = $result.find('div[id="annonce"] > dl').children()[15].children[1].children[25].children[0].data

    //var A_dater_du = $result.find('div[id="annonce"] > dl').children()[17].children[0].data
    //var Date_de_commencement_d_activité = $result.find('div[id="annonce"] > dl').children()[19].children[0].data
    var Download_link =  $result.find('p[class="pdf-unit"] > a')[0].attribs['href']
    //console.log($result.find('p[class="pdf-unit"] > a')[0].attribs['href'])

    //console.log(Typeannonce,"\n",Bc_publication,'\n',N,'\n',RCS,'\n',Denomination,'\n',Forme,
    //'\n',Download_link)//,'\n',Adresse,'\n',
    //Activite)//,'\n',Adresse_de_l_etablissement,'\n',A_dater_du,'\n',Date_de_commencement_d_activité,
    // '\n',Download_link,'\n',Etablissement,Origine_du_fond,'\n','\n',Administration,Capital,'\n')
    // console.log(Download_link)
    
   // console.log('D :',Download_link);

    //  $result.find('div[class="pagination top"] > p > a' ).each(function (index, element) {
    // result_pages_links.push($(element).attr('href'));


    var data_to_save = {
      'Typeannonce': Typeannonce,
      'Bc_publication':Bc_publication,
      'N':N,
      'RCS':RCS,
      'Denomination':Denomination,
      'Forme':Forme,
      'Download_link':Download_link,

    }

  return data_to_save;
}


//Function to add row of data in Google Apps Script



function insert_row(data){

    
    var sheet = SpreadsheetApp.getActiveSheet()
    
    //sheet.clear()
    sheet.appendRow([data['Typeannonce'],data['Bc_publication'],data['N'],data['RCS'],data['Denomination'],data['Forme'],data['Download_link']]);

    


}

