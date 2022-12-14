import ExchangeDetails_ls from './ExchangeDetails.less';
import SearchBox from '@/components/SearchBox/SearchBox';
import React, { useState, useEffect } from 'react';
import { Chart, Interval, Tooltip } from 'bizcharts';
import { Link, history } from 'umi';
import moment from 'moment';
import { Space, Table, Tag, Pagination, Select } from 'antd';
import {
    erbprice,
    total,
    epoch,
    block,
    rewardperson,
    nft,
    exchanger,
    exchangermap,
    snft,
    snft_nft_tx,
    soloexchanger,
} from '../../api/request_data/block_request';
import { timestamp, ellipsis } from '../../utils/methods/Methods';
import { utils } from 'ethers';
export default function ExchangeDetails(props) {
    const [transactionmetadata, setTransactionmeta] = useState(1);
    const [pagenumbersize, setPagenumbersize] = useState(10);
    const [pagenumber, setPagenumber] = useState(1);
    //交易所
    const [exchangerdata, setExchangerdata] = useState({});
    //交易所柱状图
    const [exchangermapdata, setExchangermapdata] = useState({});
    //snft
    const [snftdata, setSnftdata] = useState({});
    //snft交易
    const [snfttxdata, setSnfttxdata] = useState({});
    const histogramdata = [
        { time: '24h', sales: exchangermapdata.day_1 || 0 },
        { time: '7天', sales: exchangermapdata.day_7 || 0 },
        { time: '30天', sales: exchangermapdata.day30 || 0 },
        { time: '总额', sales: exchangermapdata.total || 0 },
    ];
    const providesnftcolumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, data) => (
                <Link
                    to={{
                        pathname: '/SNFTApp/SNFTDetailsApp',
                        state: { snftid: data.address, snftmata: data },
                    }}
                    style={{ color: '#7AA4FF', fontFamily: 'CustomFontMedium' }}
                >
                    {text}
                </Link>
            ),
        },
        {
            title: 'Creation Time',
            dataIndex: 'reward_at',
            key: 'reward_at',
            render: (text) => (
                <span>
                    {moment(parseInt(text) * 1000).format(
                        'YYYY-MM-DD HH:mm:ss',
                    )}
                </span>
            ),
        },
        {
            title: 'Owner',
            dataIndex: 'owner',
            key: 'owner',
            render: (text, data) => (
                <Link
                    to={{ pathname: `/AccountDetailApp/${text}`, state: text }}
                    style={{ color: '#7AA4FF', fontFamily: 'CustomFontMedium' }}
                >
                    {ellipsis(text)}
                </Link>
            ),
        },
        {
            title: 'Author',
            key: 'creator',
            dataIndex: 'creator',
            render: (text, data) => (
                <Link
                    to={{ pathname: `/AccountDetailApp/${text}`, state: text }}
                    style={{ color: '#7AA4FF', fontFamily: 'CustomFontMedium' }}
                >
                    {ellipsis(text)}
                </Link>
            ),
        },
    ];
    const exchangetradingcolumns = [
        {
            title: 'TXN Hash',
            dataIndex: 'tx_hash',
            key: 'tx_hash',
            render: (text, data) => (
                <Link
                    to={{ pathname: `/TradeDetailApp/${text}`, state: text }}
                    style={{ color: '#7AA4FF', fontFamily: 'CustomFontMedium' }}
                >
                    {ellipsis(text)}
                </Link>
            ),
        },
        {
            title: 'TXN Type',
            dataIndex: 'nft_addr',
            key: 'nft_addr',
            render: (text) => (
                <span>
                    {text.slice(0, 6) == '0x0000'
                        ? 'NFT Transaction'
                        : 'SNFT Transaction'}
                </span>
            ),
        },
        {
            title: 'TXN Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => (
                <span>
                    {moment(parseInt(text) * 1000).format(
                        'YYYY-MM-DD HH:mm:ss',
                    )}
                </span>
            ),
        },
        {
            title: 'Sender',
            key: 'from',
            dataIndex: 'from',
            render: (text, data) => (
                <Link
                    to={{ pathname: `/AccountDetailApp/${text}`, state: text }}
                    style={{ color: '#7AA4FF', fontFamily: 'CustomFontMedium' }}
                >
                    {ellipsis(text)}
                </Link>
            ),
        },
        {
            title: 'Receiver',
            key: 'to',
            dataIndex: 'to',
            render: (text, data) => (
                <Link
                    to={{ pathname: `/AccountDetailApp/${text}`, state: text }}
                    style={{ color: '#7AA4FF', fontFamily: 'CustomFontMedium' }}
                >
                    {ellipsis(text)}
                </Link>
            ),
        },
        {
            title: 'Transaction Value',
            key: 'price',
            dataIndex: 'price',
            render: (text) => <span>{utils.formatEther(text)}</span>,
        },
    ];
    const onChange = (data) => {
        setPagenumber(data);
    };
    //snft分页
    let pagedata = {
        exchanger:
            props.location.state != undefined
                ? props.location.state.exchangeid
                : JSON.parse(localStorage.getItem('exchangetext')),
        page: pagenumber,
        page_size: pagenumbersize,
    };
    //snft交易分页
    let pagedatabs = {
        address: '',
        exchanger:
            props.location.state != undefined
                ? props.location.state.exchangeid
                : JSON.parse(localStorage.getItem('exchangetext')),
        account: '',
        page: pagenumber,
        page_size: pagenumbersize,
    };
    useEffect(() => {
        if (props.location.state != undefined) {
            localStorage.setItem(
                'exchangetext',
                JSON.stringify(props.location.state.exchangeid),
            );
        }
        console.log(JSON.parse(localStorage.getItem('exchangetext')));
        soloexchanger_q(JSON.parse(localStorage.getItem('exchangetext')));
        exchangermap_q(JSON.parse(localStorage.getItem('exchangetext')));
        snft_q(pagedata);
        snft_nft_tx_q(pagedatabs);
    }, []);
    useEffect(() => {
        snft_q(pagedata);
        snft_nft_tx_q(pagedatabs);
    }, [pagenumber]);
    //单个交易所查询
    const soloexchanger_q = async (item) => {
        const data = await soloexchanger(item);
        console.log('单个交易所查询');
        console.log(data);
        if (data) {
            if (data.address == '') {
                console.log(data.address);
                history.push('/NoSearchResults');
            }
            setExchangerdata(data);
        }
    };
    //交易所柱状图查询
    const exchangermap_q = async (item) => {
        const data = await exchangermap(item);
        console.log('交易所柱状图查询');
        console.log(data);
        if (data) {
            setExchangermapdata(data);
        }
    };
    //snft查询
    const snft_q = async (item) => {
        const data = await snft(item);
        console.log('snft查询');
        console.log(data);
        if (data) {
            setSnftdata(data);
        }
    };
    //snft交易查询
    const snft_nft_tx_q = async (item) => {
        const data = await snft_nft_tx(item);
        console.log('snft交易查询');
        console.log(data);
        if (data) {
            setSnfttxdata(data);
        }
    };
    function ExchangeDetailsinputnumberonclick(e) {
        let data = document.getElementById('ExchangeDetailsinputnumber').value;
        if (e.keyCode == 13) {
            if (Number(data) != NaN) {
                setPagenumber(Number(data));
            }
        }
    }
    function Histogram() {
        return (
            <Chart height={120} autoFit data={histogramdata} pure>
                <Interval position="time*sales" animate={false} />
                <Tooltip shared showTitle={false} />
            </Chart>
        );
    }
    function transactionmeta(data) {
        if (data == 0) {
            setTransactionmeta(1);
        } else {
            setTransactionmeta(0);
        }
    }
    //交易所网址跳转
    function exchangecom() {
        window.open(
            'https://hub.wormholes.com/c' + exchangerdata.address + '/#/',
        );
    }
    //base64转码
    function hexCharCodeToStr(hexCharCodeStr) {
        try {
            if (hexCharCodeStr.slice(0, 2) == '0x') {
                // let text = Buffer.from(hexCharCodeStr, 'hex')
                // return text.toString('UTF-8')
                return hexCharCodeStr;
            } else {
                let data = new Buffer(hexCharCodeStr, 'base64').toString();
                return data;
            }
        } catch (error) {
            return hexCharCodeStr;
        }
    }
    return (
        <>
            <div className={ExchangeDetails_ls.ExchangeDetailsBox}>
                <div
                    className={ExchangeDetails_ls.ExchangeDetailsBox_headerData}
                >
                    <div
                        className={
                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_title
                        }
                    >
                        Marketplace Details
                        {/* <SearchBox /> */}
                    </div>
                    <div
                        className={
                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox
                        }
                    >
                        <div>
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_imgtitle
                                }
                            >
                                {/* <div className={ExchangeDetails_ls.ExchangeDetailsBox_headportrait}> */}
                                {/* <img /> */}
                                {/* </div> */}
                                <span>
                                    {/* {hexCharCodeToStr(exchangerdata.name)} */}
                                    {exchangerdata.name}
                                </span>
                            </div>
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Data
                                }
                            >
                                <div>
                                    <p
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Data_name
                                        }
                                    >
                                        Creation Time
                                    </p>
                                    <p
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Data_name
                                        }
                                    >
                                        Creator
                                    </p>
                                    <p
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Data_name
                                        }
                                    >
                                        Marketplace Address
                                    </p>
                                </div>
                                <div style={{ marginLeft: '20px' }}>
                                    <p
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Data_item
                                        }
                                    >
                                        {moment(
                                            parseInt(exchangerdata.timestamp) *
                                                1000,
                                        ).format('YYYY-MM-DD')}
                                    </p>
                                    <Link
                                        to={{
                                            pathname: `/AccountDetailApp/${exchangerdata.creator}`,
                                            state: exchangerdata.creator,
                                        }}
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Data_item
                                        }
                                        style={{ color: '#7AA4FF' }}
                                    >
                                        {(exchangerdata.creator &&
                                            exchangerdata.creator.slice(0, 12) +
                                                '...' +
                                                exchangerdata.creator.slice(
                                                    -12,
                                                    exchangerdata.creator
                                                        .length,
                                                )) ||
                                            '-'}
                                    </Link>
                                    {exchangerdata.address && (
                                        <p
                                            onClick={exchangecom}
                                            className={
                                                ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Data_item
                                            }
                                            style={{
                                                color: '#7AA4FF',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {'https://hub.wormh...' +
                                                exchangerdata.address.slice(
                                                    -6,
                                                    exchangerdata.address
                                                        .length,
                                                ) +
                                                '/#/'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            className={
                                ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Histogram
                            }
                        >
                            <p
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_Histogram_title
                                }
                            >
                                Transaction Volume
                            </p>
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_HistogramBox
                                }
                            >
                                <Histogram />
                                <p>
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_HistogramBox_name
                                        }
                                        style={{ marginLeft: '14px' }}
                                    >
                                        24h
                                    </span>
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_HistogramBox_name
                                        }
                                        style={{ marginLeft: '30px' }}
                                    >
                                        7d
                                    </span>
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_HistogramBox_name
                                        }
                                        style={{ marginLeft: '32px' }}
                                    >
                                        30d
                                    </span>
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_headerData_textBox_HistogramBox_name
                                        }
                                        style={{ marginLeft: '28px' }}
                                    >
                                        Total
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* 交易历史-Meta信息   按钮 */}
                    <div
                        className={
                            ExchangeDetails_ls.ExchangeDetailsBox_titleData_buttonBox
                        }
                    >
                        {transactionmetadata == 0 ? (
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_titleData_buttonBox_Transactionhistory1
                                }
                                onClick={transactionmeta.bind(this, 0)}
                            >
                                Submitted S-NFTs
                            </div>
                        ) : (
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_titleData_buttonBox_Transactionhistory2
                                }
                            >
                                Submitted S-NFTs
                            </div>
                        )}
                        {transactionmetadata == 1 ? (
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_titleData_buttonBox_metaData1
                                }
                                onClick={transactionmeta.bind(this, 1)}
                            >
                                Transactions
                            </div>
                        ) : (
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_titleData_buttonBox_metaData2
                                }
                            >
                                Transactions
                            </div>
                        )}
                    </div>
                    {transactionmetadata == 1 ? (
                        <div
                            className={
                                ExchangeDetails_ls.ExchangeDetailsBox_table
                            }
                            id="ExchangeDetailsTableApp"
                        >
                            <Table
                                columns={providesnftcolumns}
                                dataSource={snftdata.nfts}
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                            />
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_Pagination
                                }
                                id="ExchangeDetailsBoxPagination"
                            >
                                <Pagination
                                    defaultCurrent={1}
                                    total={snftdata.total}
                                    onChange={onChange}
                                    showSizeChanger={false}
                                    current={pagenumber}
                                />
                                <div className={ExchangeDetails_ls.flexBox}>
                                    <div
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_d
                                        }
                                    >
                                        10/Page
                                    </div>
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_span1
                                        }
                                    >
                                        To
                                    </span>
                                    <input
                                        id="ExchangeDetailsinputnumber"
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_input
                                        }
                                        onKeyDown={
                                            ExchangeDetailsinputnumberonclick
                                        }
                                    />
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_span2
                                        }
                                    >
                                        Page
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={
                                ExchangeDetails_ls.ExchangeDetailsBox_table
                            }
                            id="ExchangeDetailsTableApp"
                        >
                            <Table
                                columns={exchangetradingcolumns}
                                dataSource={snfttxdata.nft_txs}
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                            />
                            <div
                                className={
                                    ExchangeDetails_ls.ExchangeDetailsBox_Pagination
                                }
                                id="ExchangeDetailsBoxPagination"
                            >
                                <Pagination
                                    defaultCurrent={1}
                                    total={snfttxdata.total}
                                    onChange={onChange}
                                    showSizeChanger={false}
                                    current={pagenumber}
                                />
                                <div className={ExchangeDetails_ls.flexBox}>
                                    <div
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_d
                                        }
                                    >
                                        10/Page
                                    </div>
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_span1
                                        }
                                    >
                                        To
                                    </span>
                                    <input
                                        id="ExchangeDetailsinputnumber"
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_input
                                        }
                                        onKeyDown={
                                            ExchangeDetailsinputnumberonclick
                                        }
                                    />
                                    <span
                                        className={
                                            ExchangeDetails_ls.ExchangeDetailsBox_Pagination_span2
                                        }
                                    >
                                        Page
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
