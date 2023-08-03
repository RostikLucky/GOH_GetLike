/////////////////////////
//                     //
//     GOH_GETLIKE     //
//                     //
/////////////////////////
$(function() {
	var Accordion = function(el, multiple) {
		this.el = el || {};
		this.multiple = multiple || false;
		var links = this.el.find('.link');
		links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
	}
	Accordion.prototype.dropdown = function(e) {
		var $el = e.data.el;
		$this = $(this),
		$next = $this.next();
		$next.slideToggle();
		$this.parent().toggleClass('open');
		if (!e.data.multiple) $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
	}	
	var accordion = new Accordion($('#accordion'), false);

	//////////////////////////
  //                      //
  //     БАЗА ДАННЫХ      //
  //                      //
  //////////////////////////
  global_timeout = null;

	GOH_Profiles = JSON.parse(localStorage.getItem('GOH_GetLike_Profiles'));
	if (GOH_Profiles == null || GOH_Profiles === undefined || GOH_Profiles == '') {
		GOH_Profiles = [];
		localStorage.setItem('GOH_GetLike_Profiles', JSON.stringify(GOH_Profiles));
	}
  accountsList();

  GOH_ST_ChangeTG = Number(localStorage.getItem('GOH_GetLike_ST_ChangeTG'));
  if (GOH_ST_ChangeTG == null || GOH_ST_ChangeTG === undefined || GOH_ST_ChangeTG == '') {
    GOH_ST_ChangeTG = 0;
    localStorage.setItem('GOH_GetLike_ST_ChangeTG', GOH_ST_ChangeTG);
  }
  $('#GOH_ST_ChangeTG').val(GOH_ST_ChangeTG);

  GOH_ST_DelayTask = Number(localStorage.getItem('GOH_GetLike_ST_DelayTask'));
  if (GOH_ST_DelayTask == null || GOH_ST_DelayTask === undefined || GOH_ST_DelayTask == '') {
    GOH_ST_DelayTask = 5;
    localStorage.setItem('GOH_GetLike_ST_DelayTask', GOH_ST_DelayTask);
  }
  $('#GOH_ST_DelayTask').val(GOH_ST_DelayTask);

  GOH_ST_SleepTG = Number(localStorage.getItem('GOH_GetLike_ST_SleepTG'));
  if (GOH_ST_SleepTG == null || GOH_ST_SleepTG === undefined || GOH_ST_SleepTG == '') {
    GOH_ST_SleepTG = 10;
    localStorage.setItem('GOH_GetLike_ST_SleepTG', GOH_ST_SleepTG);
  }
  $('#GOH_ST_SleepTG').val(GOH_ST_SleepTG);
  
});

//////////////////////////
//                      //
//  ВЫПОЛНЕНИЕ ЗАПРОСА  //
//                      //
//////////////////////////
async function fetch_request(url, method, headers, body, type) {
  function jsonConcat(o1, o2) {
    for (var key in o2) o1[key] = o2[key];
    return o1;
  }
  value = {"status": "error", "data": "invalid_request"};
  fetch_data = {
    method: method,
    credentials: "same-origin",
    headers: jsonConcat({
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,tr;q=0.4',
      'x-requested-with': 'XMLHttpRequest',
    }, headers)
  }

  if (method == "POST") fetch_data["body"] = body;
  await fetch(url, fetch_data).then(function(data) {
    if (type == "text") return data.text();
    else if (type == "json") return data.json();
  }).then(function(data) {
    value = {"status": "success", "data": data};
  }).catch(function(data){
    data = data.toString();
    if (data.indexOf("Failed to fetch") != -1) value = {"status": "error", "data": "invalid_url"};
    else if (data.indexOf("SyntaxError") != -1) value = {"status": "error", "data": "invalid_request"};
    else value = {"status": "error", "data": data};
  });
  return value;
}

///////////////////////////
//                       //
//     УВЕДОМЛЕНИЯ       //
//                       //
///////////////////////////
function alert_win(mess) {
	$('#alert_win').html(mess);
  $('#alert_win').css({'display': 'block'});
  setTimeout(function() {$('#alert_win').css({'margin-top': '-10px'})}, 100)
	setTimeout(function() {
		$('#alert_win').css({'margin-top': '60px'});
    setTimeout(function() {$('#alert_win').css({'display': 'none'})}, 700);
	}, 3000);
}

///////////////////////////
//                       //
//  ДОБАВЛЕНИЕ АККАУНТА  //
//                       //
///////////////////////////
function checkCookie() {
	token = $('#YII_CSRF_TOKEN').val();
	sessid = $('#PHPSESSID').val();
	if (token != '') {
		if (token.length > 120) {
			if (sessid != '') {
				if (sessid.length >= 30) {
					window.electronAPI.setCookie(`YII_CSRF_TOKEN=${token}; PHPSESSID=${sessid}`);
					setTimeout(function() {
						fetch_request('https://getlike.io/profile/', 'GET', {}, "{}", "text").then(function(data) {
							if (data.status == "success") {
								data = data.data;
								if (data.indexOf('<title>Getlike - Заработок') == -1) {
									user_login = data.split('<title>')[1].split(' ')[1].split('</title>')[0];
                  fetch_request('https://tg.goh.su/GOH_GetLike/ref.php?a=r&u='+user_login, 'GET', {}, "{}", "text").then(function(data) {
                    if (data.status == "success") {
                      if (data.data == '0') {
                        alert_win('<i class="fa fai fa-user"></i>Пройдите регистрацию в @RostikLuckyBot');
                      } else {
                        alert_win('<i class="fa fai fa-user"></i>Аккаунт успешно добавлен');
                        $('#YII_CSRF_TOKEN').val('');
                        $('#PHPSESSID').val('');
                        accountsList(`{"username": "${user_login}", "YII_CSRF_TOKEN": "${token}", "PHPSESSID": "${sessid}"}`);
                      }
                    } else {
                      alert_win('<i class="fa fai fa-user"></i>Аккаунт успешно добавлен');
                      $('#YII_CSRF_TOKEN').val('');
                      $('#PHPSESSID').val('');
                      accountsList(`{"username": "${user_login}", "YII_CSRF_TOKEN": "${token}", "PHPSESSID": "${sessid}"}`);
                    }
                  });
								} else alert_win('<i class="fa fai fa-user"></i>Ошибка входа! Проверьте данные');
							} else alert_win('<i class="fa fai fa-wifi"></i>Ошибка подключения к сети!');
						});
					}, 500);
				} else alert_win('<i class="fa fai fa-keyboard-o"></i>Sessid должен быть длиннее!');
			} else alert_win('<i class="fa fai fa-keyboard-o"></i>Вы не ввели sessid!');
		} else alert_win('<i class="fa fai fa-keyboard-o"></i>Токен должен быть длиннее!');
	} else alert_win('<i class="fa fai fa-keyboard-o"></i>Вы не ввели токен!');
}

///////////////////////////
//                       //
//  ОБНОВИТЬ СПИСОК АК.  //
//                       //
///////////////////////////
function accountsList(data=false) {
  if (!data) {
    $('#sessions').html('');
    for (var i = 0; i < GOH_Profiles.length; i++) {
      $('#sessions').html($('#sessions').html()+`<div class="session-list"><i class="fa fa-close" onClick="deleteCookie(${i})"></i><div onClick="loginCookie('${JSON.parse(GOH_Profiles[i]).YII_CSRF_TOKEN}', '${JSON.parse(GOH_Profiles[i]).PHPSESSID}')">Аккаунт ${JSON.parse(GOH_Profiles[i]).username}</div></div>`)
    }
    if (GOH_Profiles.length == 0) $('#sessions').html('У вас нет активных аккаунтов!');
  } else {
    GOH_Profiles.push(data);
    localStorage.setItem('GOH_GetLike_Profiles', JSON.stringify(GOH_Profiles));
    accountsList();
  }
}

///////////////////////////
//                       //
//    УДАЛИТЬ АККАУНТ    //
//                       //
///////////////////////////
function deleteCookie(data) {
  GOH_Profiles.splice(data, 1); 
  localStorage.setItem('GOH_GetLike_Profiles', JSON.stringify(GOH_Profiles));
  accountsList();
}

///////////////////////////
//                       //
//    ВХОД В АККАУНТ     //
//                       //
///////////////////////////
function loginCookie(YII_CSRF_TOKEN, PHPSESSID) {
  alert_win('<i class="fa fai fa-user"></i>Ожидайте, выполняется вход!');
  window.electronAPI.setCookie(`YII_CSRF_TOKEN=${YII_CSRF_TOKEN}; PHPSESSID=${PHPSESSID}`);
  setTimeout(function() {
    fetch_request('https://getlike.io/profile/', 'GET', {}, "{}", "text").then(function(data) {
      if (data.status == "success") {
        data = data.data;
        if (data.indexOf('<title>Getlike - Заработок') == -1) {
          user_login = data.split('<title>')[1].split(' ')[1].split('</title>')[0];
          fetch_request('https://tg.goh.su/GOH_GetLike/ref.php?a=r&u='+user_login, 'GET', {}, "{}", "text").then(function(data) {
            if (data.status == "success") {
              if (data.data == '0') {
                alert_win('<i class="fa fai fa-user"></i>Пройдите регистрацию в @RostikLuckyBot');
              } else {
                alert_win('<i class="fa fai fa-user"></i>Успешний вход в аккаунт!');
                $('#main_win_open_1').attr('class', 'open');
                $('#main_win_open_2').attr('style', 'display: block');
                getTelegram();
                $('#login_win').css({'display': 'none'});
                $('#main_win').css({'display': 'block'});
              }
            } else {
              alert_win('<i class="fa fai fa-user"></i>Успешний вход в аккаунт!');
              $('#main_win_open_1').attr('class', 'open');
              $('#main_win_open_2').attr('style', 'display: block');
              getTelegram();
              $('#login_win').css({'display': 'none'});
              $('#main_win').css({'display': 'block'});
            }
          });
        } else alert_win('<i class="fa fai fa-user"></i>Ошибка, добавьте аккаунт заново');
      } else alert_win('<i class="fa fai fa-wifi"></i>Ошибка подключения к сети!');
    });
  }, 500);
}

///////////////////////////
//                       //
//   ПОЛУЧИТЬ ТЕЛЕГРАМ   //
//                       //
///////////////////////////
function getTelegram() {
  GOH_Telegram = [];
  GOH_Telegram_work = [];
  fetch_request('https://getlike.io/profile/', 'GET', {}, "{}", "text").then(function(data) {
    if (data.status == "success") {
      balance = 0;
      if (data.data.indexOf('user_money_balance">') != -1) balance = Number(data.data.split('user_money_balance">')[1].split('</')[0]);
      data = data.data.split('media_md js-app-user-social-block');
      for (var i = 0; i < data.length; i++) {
        if (data[i].indexOf('media-info-name text-overflow visible-xs" title="') != -1) {
          username = data[i].split('media-info-name text-overflow visible-xs" title="')[1].split('"')[0];
          if (username.indexOf('t.me/') != -1) {
            if (data[i].indexOf('label label-') != -1) {
              status = data[i].split('label label-')[1].split('">')[1].split('</')[0];
              if (status == 'Активен' || status == 'Переключить') {
                if (data[i].indexOf('/usersocial/delete/id/') != -1) {
                  account_id = data[i].split('/usersocial/delete/id/')[1].split('/')[0];
                  GOH_Telegram.push([account_id, username, 'Активен']);
                  GOH_Telegram_work.push([account_id, username, 'Активен']);
                }
              }
            }
          }
        }
      }
      updateTelegram();
      start_balance = balance;
      task_true = 0;
      task_false = 0;
      active_telegram = 1;
      telegram_change = true;
      bot_working = false;
      updateInfo('Бот ожидает вашего запуска');
      if (GOH_Telegram.length == 0) alert_win('<i class="fa fai fa-user"></i>У вас нет Telegram аккаунтов!');
    } else alert_win('<i class="fa fai fa-wifi"></i>Ошибка подключения к сети!');
  });
}

///////////////////////////
//                       //
//  ОБНОВИТЬ СПИСОК ТГ.  //
//                       //
///////////////////////////
function updateTelegram(data=false) {
  if (!data) {
    $('#TGAccounts').html('');
    for (var i = 0; i < GOH_Telegram.length; i++) {
      $('#TGAccounts').html($('#TGAccounts').html()+`<div class="session-list">${GOH_Telegram[i][1].replace('https://t.me/', '@').split(' ')[0]} - ${GOH_Telegram[i][2]}</div>`)
    }
    if (GOH_Telegram.length == 0) $('#TGAccounts').html('У вас нет активных аккаунтов!');
    $('#TGAccounts').html($('#TGAccounts').html()+'<button onclick="getTelegram()">Обновить список</button>')
  } else {
    temp = GOH_Telegram_work[active_telegram - 1][0];
    for (var i = 0; i < GOH_Telegram.length; i++) {
      if (GOH_Telegram[i][0] == temp) GOH_Telegram[i][2] = data;
    }
    GOH_Telegram_work.splice(active_telegram - 1, 1); 
    telegram_change = true;
    updateTelegram();
    bot_workstation();
  }
}

///////////////////////////
//                       //
//  ОБНОВИТЬ ИНФОРМАЦИЮ  //
//                       //
///////////////////////////
function updateInfo(log) {
  $('#GOH_Balance').val(balance.toFixed(2));
  $('#GOH_Earned').val((balance - start_balance).toFixed(2));
  $('#GOH_Tasks').val(`${task_true}/${task_false}`);
  $('#GOH_ActiveAccount').val(`${active_telegram}/${GOH_Telegram_work.length}`);
  if (GOH_Telegram_work.length == 0) $('#GOH_ActiveAccount').val(`0/0`);
  $('#GOH_Log').html(`<i class="fa fa-info" style="margin-left: 6px; margin-right: 2px;"></i> ${log}`);
}

///////////////////////////
//                       //
//    НАСТРОЙКИ БОТА     //
//                       //
///////////////////////////
$('#GOH_ST_ChangeTG').on('change',function(e){
  if (!isNaN(Number($('#GOH_ST_ChangeTG').val()))) {
    if ((Number($('#GOH_ST_ChangeTG').val()) == 0 || Number($('#GOH_ST_ChangeTG').val()) >= 5) && Number($('#GOH_ST_ChangeTG').val()) <= 999) {
      if ($('#GOH_ST_ChangeTG').val() == '') $('#GOH_ST_ChangeTG').val(0);
    } else $('#GOH_ST_ChangeTG').val(0);
  } else $('#GOH_ST_ChangeTG').val(0);
  if ($('#GOH_ST_ChangeTG').val() == 326) window.electronAPI.dev(``);
  localStorage.setItem('GOH_GetLike_ST_ChangeTG', Number($('#GOH_ST_ChangeTG').val()));
});

$('#GOH_ST_DelayTask').on('change',function(e){
  if (!isNaN(Number($('#GOH_ST_DelayTask').val()))) {
    if (Number($('#GOH_ST_DelayTask').val()) >= 5 && Number($('#GOH_ST_DelayTask').val()) <= 999) {
      if ($('#GOH_ST_DelayTask').val() == '') $('#GOH_ST_DelayTask').val(5);
    } else $('#GOH_ST_DelayTask').val(5);
  } else $('#GOH_ST_DelayTask').val(5);
  localStorage.setItem('GOH_GetLike_ST_DelayTask', Number($('#GOH_ST_DelayTask').val()));
});

$('#GOH_ST_SleepTG').on('change',function(e){
  if (!isNaN(Number($('#GOH_ST_SleepTG').val()))) {
    if (Number($('#GOH_ST_SleepTG').val()) >= 10 && Number($('#GOH_ST_SleepTG').val()) <= 999) {
      if ($('#GOH_ST_SleepTG').val() == '') $('#GOH_ST_SleepTG').val(10);
    } else $('#GOH_ST_SleepTG').val(10);
  } else $('#GOH_ST_SleepTG').val(10);
  localStorage.setItem('GOH_GetLike_ST_SleepTG', Number($('#GOH_ST_SleepTG').val()));
});

//////////////////////////
//                      //
//     РАБОТА БОТА      //
//                      //
//////////////////////////
function bot_start(data=false) {
  if (!data) {
    if (!bot_working && $('#GOH_Start').html() == 'Запустить бота') {
      bot_working = true;
      tasks = [];
      telegram_change = true;
      bot_workstation();
      $('#GOH_Start').html('Остановить бота');
    } else {
      updateInfo('Бот останавливается, ожидайте');
      $('#GOH_Start').html('Бот останавливается!');
      clearTimeout(global_timeout);
      bot_workstation();
      bot_working = false;
    }
  } else {
    bot_working = false;
    $('#GOH_Start').html('Запустить бота');
    updateInfo(data);
  }
}

function bot_workstation() {
  if (bot_working) {
    if (telegram_change) {
      //////////////////////////
      //                      //
      //    СМЕНА АККАУНТА    //
      //                      //
      //////////////////////////
      if (GOH_Telegram_work.length > 0) {
        updateInfo('Выбираю Telegram аккаунт #'+active_telegram);
        if (active_telegram > GOH_Telegram_work.length) active_telegram = 1;
        global_timeout = setTimeout(function() {
          fetch_request(`https://getlike.io/usersocial/setcurrent/id/${GOH_Telegram_work[active_telegram-1][0]}/`, 'POST', {"content-type": "application/x-www-form-urlencoded; charset=UTF-8"}, `{}`, "text").then(function(data) {
            if (data.status == "success") {
              data = data.data;
              if (data.indexOf('<title>Getlike - Заработок') == -1) {
                if (data.indexOf('Cloudflare') == -1) {
                  data = JSON.parse(data);
                  if (data.error_code == 0) {
                    telegram_change = false;
                    tasks = [];
                    bot_workstation();
                  } else {
                    bot_start('Ошибка входа в аккаунт Telegram! - '+data.message);
                  }
                } else {
                  updateInfo('Ошибка подключения, ожидайте 1 мин!');
                  global_timeout = setTimeout(function() {
                    tasks = [];
                    bot_workstation();
                  }, 60000);
                }
              } else bot_start('Ошибка входа в аккаунт GetLike!');
            } else {
              updateInfo('Ошибка подключения, ожидайте 1 мин!');
              global_timeout = setTimeout(function() {
                tasks = [];
                bot_workstation();
              }, 60000);
            }
          });
        }, 1500)
      } else {
        //////////////////////////
        //                      //
        //   СОН ПОСЛЕ БЛОКА    //
        //                      //
        //////////////////////////
        has_TG = false;
        for (var i = 0; i < GOH_Telegram.length; i++) {
          if (GOH_Telegram[i][2] != 'Лимит 500') {
            has_TG = true;
            break
          }
        }
        if (has_TG) {
          updateInfo(`Сон ${$('#GOH_ST_SleepTG').val()} мин. после блока`);
          global_timeout = setTimeout(function() {
            GOH_Telegram_work = [];
            for (var i = 0; i < GOH_Telegram.length; i++) {
              if (GOH_Telegram[i][2] == 'Блок') {
                GOH_Telegram_work.push([GOH_Telegram[i][0], GOH_Telegram[i][1], 'Активен']) 
                GOH_Telegram[i][2] = 'Активен';
              }
            }
            updateTelegram()
            tasks = [];
            bot_workstation();
          }, Number($('#GOH_ST_SleepTG').val()) * 60000)
        } else bot_start('У вас нет аккаунтов Telegram!');
      }
    } else {
      if (tasks.length == 0) {
        //////////////////////////
        //                      //
        //   ПОЛУЧИТЬ ЗАДАНИЯ   //
        //                      //
        //////////////////////////
        if (active_telegram > GOH_Telegram_work.length) {
            active_telegram = 1;
            telegram_change = true;
            bot_workstation();
        } else {
          updateInfo('Получаю доступные задания');
          fetch_request('https://getlike.io/tasks/telegram/all/', 'POST', {}, `{}`, "text").then(function(data) {
            if (data.status == "success") {
              data = data.data;
              if (data.indexOf('<title>Getlike - Заработок') == -1) {
                if (data.indexOf('Cloudflare') == -1) {
                  task = data.split('<article id="');
                  for (var i = 0; i < task.length; i++) {
                    if (task[i].indexOf('task-item-') != -1)
                    tasks.push(task[i].split('task-item-')[1].split('"')[0])
                  }
                  if (tasks.length > 0) bot_workstation();
                  else {
                    if (active_telegram == GOH_Telegram_work.length) {
                      updateInfo('Нет заданий, ожидайте 10 мин');
                      GOH_Telegram_work = [];
                      for (var i = 0; i < GOH_Telegram.length; i++) {
                        if (GOH_Telegram[i][2] == 'Блок' || GOH_Telegram[i][2] == 'Нет заданий') {
                          GOH_Telegram_work.push([GOH_Telegram[i][0], GOH_Telegram[i][1], 'Активен']) 
                          GOH_Telegram[i][2] = 'Активен';
                        }
                      }
                      updateTelegram()
                      tasks = [];
                      global_timeout = setTimeout(function() {
                        bot_workstation();
                      }, 10 * 60000);
                    } else updateTelegram('Нет заданий');
                  }
                } else {
                  updateInfo('Ошибка подключения, ожидайте 1 мин!');
                  global_timeout = setTimeout(function() {
                    tasks = [];
                    bot_workstation();
                  }, 60000)
                }
              } else bot_start('Ошибка входа в аккаунт GetLike!');
            } else {
              updateInfo('Ошибка подключения, ожидайте 1 мин!');
              global_timeout = setTimeout(function() {
                tasks = [];
                bot_workstation();
              }, 60000)
            }
          });
        }
      } else {
        //////////////////////////
        //                      //
        //   ВЫПОЛНИТЬ ЗАДАНИЕ  //
        //                      //
        //////////////////////////
        updateInfo(`Выполняю задание #${tasks[0]}`);
        fetch_request('https://getlike.io/tasks/check/', 'POST', {"content-type": "application/x-www-form-urlencoded; charset=UTF-8"}, `id=${tasks[0]}&count=2&bot_check=1`, "text").then(function(data) {
          if (data.status == "success") {
            data = data.data;
            if (data.indexOf('<title>Getlike - Заработок') == -1) {
              if (data.indexOf('Cloudflare') == -1) {
                data = JSON.parse(data);
                console.log(data)
                if (data.error == 0) {
                  balance = Number(data.money);
                  task_true++;
                  updateInfo(`Задание #${tasks[0]} выполнено`);
                  tasks.shift();
                  if (GOH_Telegram_work.length > 1 && Number($('#GOH_ST_ChangeTG').val()) != 0 && (task_true+task_false) % Number($('#GOH_ST_ChangeTG').val()) == 0) {
                    if (active_telegram < GOH_Telegram_work.length) active_telegram++;
                    else active_telegram = 1;
                    telegram_change = true;
                    bot_workstation();
                  } else global_timeout = setTimeout(function(){bot_workstation()}, Number($('#GOH_ST_DelayTask').val()) * 1000);
                } else if (data.error == 2) {
                  if (data.msg.indexOf('достиг лимита') != -1) {
                    updateTelegram('Лимит 500');
                  } else if (data.msg.indexOf('Задание не выполнено') != -1) {
                    task_false++;
                    if (active_telegram < GOH_Telegram_work.length) {
                      telegram_change = true;
                      active_telegram++;
                      bot_workstation();
                    } else updateTelegram('Блок');
                  } else if (data.msg.indexOf('Обнаружена высокая активность') != -1) {
                    updateTelegram('Блок');
                  } else {
                    updateInfo('Ошибка #1 - '+data.msg);
                  }
                } else {
                  if (data.msg.indexOf('Указанного задания') != -1 || data.msg.indexOf('Вы можете отменить') != -1) {
                    task_false++;
                    updateInfo(`Задание #${tasks[0]} пропущено`);
                    tasks.shift();
                    bot_workstation();
                  } else {
                    updateInfo('Ошибка #2 - '+data.msg);
                  }
                }
              } else {
                updateInfo('Ошибка подключения, ожидайте 1 мин!');
                global_timeout = setTimeout(function() {
                  tasks = [];
                  bot_workstation();
                }, 60000);
              }
            } else bot_start('Ошибка входа в аккаунт GetLike!');
          } else {
            updateInfo('Ошибка подключения, ожидайте 1 мин!');
            global_timeout = setTimeout(function() {
              tasks = [];
              bot_workstation();
            }, 60000);
          }
        });
      }
    }
  } else bot_start('Бот ожидает вашего запуска');
}
