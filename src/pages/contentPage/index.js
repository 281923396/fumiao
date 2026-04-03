import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { get } from '../../utils/request';
import Config from '../../utils/constant';
import { Tabs, Empty, Carousel, message, Image } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { cloneDeep, isEmpty, map } from 'lodash-es';
import { useGlobal } from '../contexts/GlobalContext';
import CompanyDefault from '../../assets/companyDefault.png';

const ContentPage = ({ currentMenu, changeCurrentMenu, openPage, changeOpenPage }) => {
  const { Sid, BaseUrl } = Config;
  const { globalField } = useGlobal();

  const [activeKey, setActiveKey] = useState('');
  const [tabItems, setTabItems] = useState([]);
  const [titleOne, setTitleOne] = useState('1');
  const [titleTwo, setTitleTwo] = useState('1');
  const [titleThree, setTitleThree] = useState('1');
  const [unreadNoticeList, setUnreadNoticeList] = useState([]);
  const [unfinishedProcessList, setUnfinishedProcessList] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [noticeList, setNoticeList] = useState([]);
  const [companySystemList, setCompanySystemList] = useState([]);
  const [companyNewList, setCompanyNewList] = useState([]);
  const [cultureList, setCultureList] = useState([]);
  const [shortcutList, setShortcutList] = useState([]);

  const tabItemsRef = useRef(tabItems);
  const activeKeyRef = useRef(activeKey);

  useEffect(() => {
    getNoticeList();
    getCompanySystemList();
    getCultureList();
    getShortcutList();
  }, [])

  useEffect(() => {
    tabItemsRef.current = tabItems;
  }, [tabItems]);

  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  // 判断日期是否在指定天数内
  const isWithinDays = (dateStr, days) => {
    if (!dateStr) return false;
    
    // 调试日期
  
    
    // 尝试解析日期
    try {
      // 获取当前日期（只保留年月日）
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // 处理日期字符串
      let date;
      if (dateStr.includes('-')) {
        // 处理类似 "2023-05-20" 或 "2023-05-20 14:30:00" 格式
        date = new Date(dateStr.replace(/-/g, '/'));
      } else if (!isNaN(dateStr)) {
        // 如果是纯数字时间戳格式
        date = new Date(parseInt(dateStr));
      } else {
        // 其他格式尝试直接解析
        date = new Date(dateStr);
      }
      
      // 只保留年月日部分
      date.setHours(0, 0, 0, 0);
      
      if (isNaN(date.getTime())) {
        console.error('无效日期:', dateStr);
        return false;
      }
      
      // 计算日期差（毫秒转换为天）
      const timeDifference = currentDate.getTime() - date.getTime();
      const dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
      
      
      // 如果日期差小于指定天数，则返回true
      return dayDifference < days;
    } catch (error) {
      console.error('日期解析错误:', error, dateStr);
      return false;
    }
  };

  // 添加格式化日期的方法
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      let date;
      if (dateStr.includes('-')) {
        // 处理类似 "2023-05-20" 或 "2023-05-20 14:30:00" 格式
        date = new Date(dateStr.replace(/-/g, '/'));
      } else if (!isNaN(dateStr)) {
        // 如果是纯数字时间戳格式
        date = new Date(parseInt(dateStr));
      } else {
        // 其他格式尝试直接解析
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        console.error('无效日期:', dateStr);
        return dateStr;
      }
      
      // 格式化为 yyyy-mm-dd
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('日期格式化错误:', error, dateStr);
      return dateStr;
    }
  };

  // 需要获取到配置字段再去调用的接口
  useEffect(() => {
    if (globalField) {
      getTodoList(globalField.messageRefreshRate ? Number(globalField.messageRefreshRate) * 1000 : 30000);
      getUnreadNotice(globalField.messageRefreshRate ? Number(globalField.messageRefreshRate) * 1000 : 30000);
      getUnfinishedProcess(globalField.messageRefreshRate ? Number(globalField.messageRefreshRate) * 1000 : 30000);
      getCompanyNewList();
    }
  }, [globalField])

  // 获取快捷方式
  const getShortcutList = () => {
    get('/r/w', { cmd: 'com.bono.portal.userfunction', sid: Sid }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.shortCuts)) {
        const list = res.data.shortCuts;
        for (const key in list) {
          let iconUrl = null;
          if (list[key].appIconUrl) {
            // 简化URL构建逻辑，使用正确的/r/df格式
            if (list[key].appIconUrl.startsWith('/df')) {
              // 如果已经是/df开头，添加/r前缀
              iconUrl = BaseUrl + '/r' + list[key].appIconUrl;
            } else if (list[key].appIconUrl.startsWith('/')) {
              // 如果以/开头但不是/df，替换为/r/df
              iconUrl = BaseUrl + '/r/df' + list[key].appIconUrl.substring(1);
            } else {
              // 其他情况，添加/r/df/
              iconUrl = BaseUrl + '/r/df/' + list[key].appIconUrl;
            }
          }
          list[key].iconUrl = iconUrl;
        }
        setShortcutList(list);
      }
    })
  };

  // 获取通知公告
  const getNoticeList = () => {
    get('/r/w', { cmd: 'com.fumiao.portal.cms', sid: Sid, type: '1' }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.datalist)) {
        const list = res.data.datalist.slice(0, 5);
        for (const key in list) {
          list[key].newTitle = list[key].title || list[key].msgTitle;
          list[key].time = formatDate(list[key].releaseTimeExt || list[key].releaseTime);
        }
        setNoticeList(list);
      }
    })
  };

  // 获取公司新闻图片
  const getCompanyNewList = () => {
    get('/r/w', { cmd: 'com.actionsoft.apps.cms_get_board_list', sid: Sid, siteId: globalField.siteId }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.widgetList)) {
        const widgetData = res.data.widgetList.find(widget => widget.widgetName === "图片新闻");
        if (!isEmpty(widgetData?.messageListForWidget)) {
          const list = widgetData.messageListForWidget.slice(0, 4);
          for (const key in list) {
            // 获取图片URL
            let imageUrl = '';
            
            // 使用titPicUrl作为图片URL
            if (list[key].titPicUrl) {
              const url = list[key].titPicUrl;
              // 如果是相对路径，需要处理
              if (url.startsWith('./')) {
                // 移除开头的 './' 并拼接，只使用/r前缀
                imageUrl = `${BaseUrl}/r${url.substring(1)}`;
              } else {
                // 否则直接使用原始URL
                imageUrl = url;
              }
            } else if (list[key].waterMarkPicUrl) {
              // 备选：使用waterMarkPicUrl
              const url = list[key].waterMarkPicUrl;
              if (url.startsWith('./')) {
                imageUrl = `${BaseUrl}/r${url.substring(1)}`;
              } else {
                imageUrl = url;
              }
            }
            
            // 如果没有有效的图片URL，使用默认图片
            if (!imageUrl) {
              imageUrl = CompanyDefault;
            }
            list[key].imageUrl = imageUrl;
            list[key].newTitle = list[key].title || '';
            list[key].time = formatDate(list[key].createTimeExt || list[key].patternTime2 || list[key].createTime || '');
          }
          setCompanyNewList(list);
        }
      }
    })
  };

  // 获取公司文化
  const getCultureList = () => {
    get('/r/w', { cmd: 'com.fumiao.portal.cms', sid: Sid, type: '3' }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.datalist)) {
        const list = res.data.datalist.slice(0, 5);
        for (const key in list) {
          list[key].newTitle = list[key].title || list[key].msgTitle;
          list[key].time = formatDate(list[key].releaseTimeExt || list[key].releaseTime);
        }
        setCultureList(list);
      }
    })
  };

  // 获取公司制度
  const getCompanySystemList = () => {
    get('/r/w', { cmd: 'com.fumiao.portal.cms', sid: Sid, type: '2' }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.datalist)) {
        const list = res.data.datalist.slice(0, 5);
        for (const key in list) {
          list[key].newTitle = list[key].title || list[key].msgTitle;
          list[key].time = formatDate(list[key].releaseTimeExt || list[key].releaseTime);
        }
        setCompanySystemList(list);
      }
    })
  };

  // 获取我的待办
  const getTodoList = (time) => {
    get('/r/w', { cmd: 'com.bono.portal.task.todoList', sid: Sid, serachWord: '', start: '1', limit: '5', }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data?.tasks)) {
        setTodoList(res.data.tasks);
      }
      setTimeout(() => {
        getTodoList(time);
      }, time);
    })
  };

  // 获取未读通知
  const getUnreadNotice = (time) => {
    get('/r/w', { cmd: 'com.awspaas.user.apps.feymer.newportal.getUnreadNotice', sid: Sid }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data)) {
        setUnreadNoticeList(res.data);
      }
      setTimeout(() => {
        getUnreadNotice(time);
      }, time);
    })
  };

  // 获取未结事项
  const getUnfinishedProcess = (time) => {
    get('/r/w', { cmd: 'com.awspaas.user.apps.feymer.newportal.getUnfinishedProcess', sid: Sid }).then((res) => {
      if (res.result === 'ok' && !isEmpty(res?.data)) {
        setUnfinishedProcessList(res.data);
      }
      setTimeout(() => {
        getUnfinishedProcess(time);
      }, time);
    })
  };

  // 点击菜单栏处理标签页
  useEffect(() => {
    if (currentMenu !== 'home') {
      const hasCurrentTab = tabItems.some(obj => obj.key.includes(currentMenu));
      if (!hasCurrentTab) {
        let url = currentMenu.split('|')[2].replace('./w', '');
        url = `${BaseUrl}/r/w${url}`
        tabItems.push({
          label: <span title={currentMenu.split('|')[1]}>{currentMenu.split('|')[1]}</span>,
          children: <div className="contentPage">
            <iframe 
              src={url}
              className="content-iframe" 
              frameBorder="0"
            >
            </iframe>
          </div>,
          key: currentMenu,
        })
        setTabItems([...tabItems])
      }
      if (currentMenu) {
        setActiveKey(currentMenu);
      }
    }
  }, [currentMenu])

  const listenMessage = (e) => {
    if (e.data.type === 'closePage') {
      remove(e.data.pageUrl, tabItemsRef.current, activeKeyRef.current);
    }
  };

  // 5. 跨域方案（必须子页面配合）
  useEffect(() => {
    window.addEventListener('message', listenMessage);
    return () => window.removeEventListener('message', listenMessage);
  }, []);

  // 点击各模块打开标签页
  useEffect(() => {
    if (openPage.label) {
      const hasCurrentTab = tabItems.some(obj => obj.key.includes(openPage.key));
      // 没有当前页面标签就添加标签
      if (!hasCurrentTab) {
        tabItems.push({
          label: <span title={openPage.label}>{openPage.label}</span>,
          children: <div className="contentPage">
            <iframe 
              src={openPage.params ? `${openPage.key}${openPage.params}` : openPage.key}
              className="content-iframe" 
              frameBorder="0">
            </iframe>
          </div>,
          key: openPage.key
        })
        setTabItems([...tabItems])
      } else if (openPage.params) { // 有当前页面标签但是传参改变
        for (const i in tabItems) {
          if (tabItems[i].key === openPage.key) {
            tabItems[i].children = <div className="contentPage">
              <iframe 
                src={`${openPage.key}${openPage.params}`}
                className="content-iframe" 
                frameBorder="0">
              </iframe>
            </div>
          }
        }
        setTabItems([...tabItems]);
      }
      changeCurrentMenu('');
      setTimeout(() => {
        setActiveKey(openPage.key);
      });
    }
  }, [openPage])

  const remove = (targetKey, tabItems, activeKey) => {
    const targetIndex = tabItems.findIndex(pane => pane.key === targetKey);
    const newPanes = tabItems.filter(pane => pane.key !== targetKey);
    setTabItems(newPanes);
    if (newPanes.length && targetKey === activeKey) {
      const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex];
      setActiveKey(key);
    }
    if (isEmpty(newPanes)) {
      changeCurrentMenu('home');
    }
  };

  const onChange = (key) => {
    setActiveKey(key);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      remove(targetKey, tabItems, activeKey);
    }
  };

  // 打开快捷入口
  const clickShortcut = (item) => {
    
    // 检查是否是完整URL（以http://或https://开头）
    const isFullUrl = (url) => {
      return url && (
        url.startsWith('http://') || 
        url.startsWith('https://')
      );
    };
    
    // 处理以www.开头但没有协议的URL
    const ensureHttpProtocol = (url) => {
      if (url && url.startsWith('www.')) {
        return 'http://' + url;
      }
      return url;
    };
    
    // 首先根据type进行判断
    if (item.type === 'personal') {
      // 个人类型直接打开appUrl
      const fullUrl = ensureHttpProtocol(item.appUrl);
      window.open(fullUrl, "_blank");
      return;
    } else if (item.type === 'system') {
      // 系统类型需要发起请求
      
      let url = item.appUrl;
      
      if (url && url.includes('sid=null')) {
        // 替换sid=null为sid=实际值
        url = url.replace('sid=null', `sid=${Sid}`);
      }
      
      // 如果URL是完整URL，确保有http://前缀
      if (url && (url.startsWith('www.') || (!url.startsWith('/') && url.includes('.')))) {
        url = ensureHttpProtocol(url);
      }
      
      // 特殊处理SSO登录的应用（根据sso标识判断）
      if (item.sso === "1") {
        url = `${BaseUrl}/r/w${url.replace('./w', '')}`;
        // 如果URL中没有cmd参数，添加默认的cmd参数
        if (!url.includes('cmd=')) {
          const separator = url.includes('?') ? '&' : '?';
          url = `${url}${separator}cmd=com.bono.portal.ssoitalent`;
        }
        
        // 使用fetch发起请求而不是直接打开
        fetch(url)
          .then(response => response.json())
          .then(data => {
            // 根据openType决定打开方式
            if (data && data.result === "ok" && data.data && data.data.url) {
              if (item.openType === "blank") {
                window.open(data.data.url, "_blank");
              } else {
                changeOpenPage({
                  label: item.appName,
                  key: data.data.url,
                })
              }
            }
          })
          .catch(error => {
            console.error("SSO接口请求失败:", error);
          });
      } else {
        // 非SSO应用，根据URL类型处理
        if (isFullUrl(url) || url.startsWith('www.')) {
          // 完整URL直接打开
          url = ensureHttpProtocol(url);
          
          // 根据openType决定打开方式
          if (item.openType === "blank") {
            window.open(url, "_blank");
          } else {
            changeOpenPage({
              label: item.appName,
              key: url,
            })
          }
        } else {
          url = `${BaseUrl}/r/w${url.replace('./w', '')}`;
          // 根据openType决定打开方式
          if (item.openType === "blank") {
            window.open(url, "_blank");
          } else {
            changeOpenPage({
              label: item.appName,
              key: url,
            })
          }
        }
      }
      return;
    }
    
    // 处理其他类型或没有指定类型的情况
    let url = item.appUrl;
    
    // 检查URL是否是完整URL
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('www.'))) {
      url = ensureHttpProtocol(url);
      window.open(url, "_blank");
      return;
    }
    
    if (url && url.includes('sid=null')) {
      // 替换sid=null为sid=实际值
      url = url.replace('sid=null', `sid=${Sid}`);
    }
    url = `${BaseUrl}/r/w${url.replace('./w', '')}`;
    // 根据openType决定打开方式
    if (item.openType === "blank") {
      window.open(url, "_blank");
    } else {
      changeOpenPage({
        label: item.appName,
        key: url,
      })
    }
  };

  return (
    <div>
      {currentMenu !== 'home' ? (
        <div>
          <Tabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey}
            type="editable-card"
            onEdit={onEdit}
            items={tabItems}
          />
        </div>
      ) : (
        <div className="contentPage">
          <div className="container">
            <div className="leftItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className={`title ${titleOne === '1' ? 'selectedTitle' : ''}`} onClick={() => setTitleOne('1')}>待办事项</span>
                  <span className={`title ${titleOne === '2' ? 'selectedTitle' : ''}`} onClick={() => setTitleOne('2')}>未读通知</span>
                  <span className={`title ${titleOne === '3' ? 'selectedTitle' : ''}`} onClick={() => setTitleOne('3')}>未结事项</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }} onClick={() => {
                  let url = '';
                  let label = '';
                  if (titleOne === '1') {
                    label = '待办事项';
                    url = `${BaseUrl}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.workbench_main_page&boxName=todo`;
                  } else if (titleOne === '2') {
                    label = '未读通知';
                    url = `${BaseUrl}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.workbench_main_page&boxName=unreadNotice`;
                  } else {
                    
                    label = '未结事项';
                    url = `${BaseUrl}/r/w?sid=${Sid}&cmd=CLIENT_DW_PORTAL&processGroupId=obj_d88ee0915c6f448ba708d28a82c97eb3&appId=com.awspaas.user.apps.feymer.newportal&dwViewId=obj_4c2d55438a6a4313af70a8d5315de350`;
                  }
                  changeOpenPage({
                    label: label,
                    key: url,
                  })
                }}>
                  <RightOutlined style={{ marginRight: 6 }} />更多
                </div>
              </div>
              <div className="itemBody">
                {/* <div className="tagList">
                  <span style={{ backgroundColor: '#0142b8', color: '#fff' }}>全部</span>
                  <span>财务共享平台</span>
                  <span>NC系统</span>
                  <span>投资管理平台</span>
                </div> */}
                {map(titleOne === '1' ? todoList : titleOne === '2' ? unreadNoticeList : unfinishedProcessList, (item, index) => {
                  return (
                    <div className="msgItem" key={index} onClick={() => {
                      if (titleOne === '1') {
                        let newUrl = item.openUrl.replace('./w', '');
                        changeOpenPage({
                          label: item.title,
                          key: `${BaseUrl}/r/w${newUrl}`,
                        })
                      } else {
                        changeOpenPage({
                          label: item.title,
                          key: item.url,
                        })
                      }
                    }}>
                      <span
                        title={item.title}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          paddingRight: 50
                        }}
                      >{item.title}</span>
                      <span style={{ flexShrink: 0 }}>{item.beginTime}</span>
                    </div>
                  )
                })}
                {((titleOne === '1' && isEmpty(todoList)) || (titleOne === '2' && isEmpty(unreadNoticeList)) || (titleOne === '3' && isEmpty(unfinishedProcessList))) && (
                  <Empty description="暂无数据~" style={{ marginTop: 20 }} />
                )}
              </div>
            </div>
            <div className="rightItem">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className={`title ${titleTwo === '1' ? 'selectedTitle' : ''}`} onClick={() => setTitleTwo('1')}>通知公告</span>
                  <span className={`title ${titleTwo === '2' ? 'selectedTitle' : ''}`} onClick={() => setTitleTwo('2')}>公司制度</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }} onClick={() => {
                  changeOpenPage({
                    label: '资讯中心',
                    key: `${BaseUrl}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_site&siteid=${globalField.siteId}`,
                  })
                }}>
                  <RightOutlined style={{ marginRight: 6 }} />更多
                </div>
              </div>
              <div className="itemBody">
                {map(titleTwo === '1' ? noticeList : companySystemList, (item, index) => {
                  return (
                    <div className="msgItem" key={index} onClick={() => {
                      if (!item.id) {
                        message.warning('无法打开该内容，缺少必要参数！');
                        return;
                      }
                      changeOpenPage({
                        label: item.newTitle,
                        key: `${BaseUrl}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_get_message&messageId=${item.id}`,
                      })
                    }}>
                      <span
                        title={item.title}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          paddingRight: 50
                        }}
                      >{item.newTitle}</span>
                      <span style={{ flexShrink: 0 }}>{item.time}</span>
                    </div>
                  )
                })}
                {((titleTwo === '1' && isEmpty(noticeList)) || (titleTwo === '2' && isEmpty(companySystemList))) && (
                  <Empty description="暂无数据~" style={{ marginTop: 20 }} />
                )}
              </div>
            </div>
          </div>
          <div className="container" style={{ marginBottom: 0 }}>
            <div className="leftItem minHeight">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className={`title ${titleThree === '1' ? 'selectedTitle' : ''}`} onClick={() => setTitleThree('1')}>公司新闻</span>
                  <span className={`title ${titleThree === '2' ? 'selectedTitle' : ''}`} onClick={() => setTitleThree('2')}>企业文化</span>
                </div>
                <div style={{ color: '#0142b8', cursor: 'pointer' }}onClick={() => {
                  changeOpenPage({
                    label: '资讯中心',
                    key: `${BaseUrl}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_site&siteid=${globalField.siteId}`,
                  })
                }}><RightOutlined style={{ marginRight: 6 }} />更多</div>
              </div>
              <div className="itemBody">
                {titleThree === '1' ? (
                  <div style={{ display: 'flex', padding: '9px 0' }}>
                    {!isEmpty(companyNewList) && (
                      <Carousel arrows className="comPic" autoplay>
                       {map(companyNewList, (item, index) => {
                          return (
                            <div>
                              <h3
                                style={{
                                  width: 340,
                                  height: 220,
                                  backgroundImage: `url(${item.imageUrl})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  margin: 0
                                }}
                              >
                              </h3>
                            </div>
                          )
                        })}
                    </Carousel>
                    )}
                    <div className="newsList">
                      {/* <div className="newsItem" style={{ color: '#0142b8', fontWeight: 600 }}>
                        <span><span className="dot" style={{ backgroundColor: '#0142b8' }}></span>请审批<span className="newTag">NEW</span></span> */}
                      {map(companyNewList, (item, index) => {
                        return (
                          <div className="newsItem" key={index} onClick={() => {
                            // 判断是否有outUrl且是有效的外部链接
                            const outUrl = item.outUrl;
                            const isValidOutUrl = outUrl && outUrl.trim() !== '' && 
                                                outUrl !== 'http://' && 
                                                outUrl !== 'https://' &&
                                                (outUrl.startsWith('http://') || outUrl.startsWith('https://'));
                            
                            // 如果有有效的outUrl，直接打开外部链接
                            if (isValidOutUrl) {
                              window.open(outUrl, '_blank');
                              return;
                            }
                            
                            // 如果没有msgId，尝试使用id
                            const messageId = item.msgId || item.id;
                            
                            if (!messageId) {
                              message.warning('无法打开该图片新闻，缺少必要参数！');
                              return;
                            }
                            
                            changeOpenPage({
                              label: item.newTitle,
                              key: `${BaseUrl}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_get_message&messageId=${messageId}`,
                            })
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              <span className="dot"></span>
                              <span
                                title={item.title}
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  paddingRight: 50
                                }}
                              >{item.newTitle}</span>
                            </div>
                            <span style={{ flexShrink: 0 }}>{item.time}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '10px 0' }}>
                    {map(cultureList, (item, index) => {
                      return (
                        <div className="msgItem" key={index} onClick={() => {
                          if (!item.id) {
                            message.warning('无法打开该内容，缺少必要参数！');
                            return;
                          }
                          changeOpenPage({
                            label: item.newTitle,
                            key: `${BaseUrl}/r/w?sid=${Sid}&cmd=com.actionsoft.apps.cms_get_message&messageId=${item.id}`,
                          })
                        }}>
                          <span
                            title={item.title}
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              paddingRight: 50
                            }}
                          >{item.newTitle}</span>
                          <span style={{ flexShrink: 0 }}>{item.time}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {((titleThree === '1' && isEmpty(companyNewList)) || (titleThree === '2' && isEmpty(cultureList))) && (
                  <Empty description="暂无数据~" style={{ marginTop: 20 }} />
                )}
              </div>
            </div>
            <div className="rightItem minHeight">
              <div className="itemHeader">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="labelIcon"></span>
                  <span className="title" style={{ color: '#312f30', fontWeight: 600 }}>应用系统</span>
                </div>
                {/* <div style={{ color: '#0142b8', cursor: 'pointer' }}><RightOutlined style={{ marginRight: 6 }} />更多</div> */}
              </div>
              <div className="itemBody">
                <div style={{ padding: '10px 0', display: 'flex', flexWrap: 'wrap' }}>
                  {map(shortcutList, (item, index) => {
                    return (
                      <div className="shortcutItem" onClick={() => clickShortcut(item)}>
                        <div>
                          <Image src={item.iconUrl} width={50} height={50} preview={false} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#333', marginTop: 5 }}>{item.appName}</div>
                      </div>
                    )
                  })}
                </div>
                {isEmpty(shortcutList) && (
                  <Empty description="暂无数据~" style={{ marginTop: 20 }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentPage;
