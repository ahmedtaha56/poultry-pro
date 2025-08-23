import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    ActivityIndicator,
    Image,
    FlatList
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const DashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const screenWidth = Dimensions.get('window').width;
    const [timeRange, setTimeRange] = useState('7days');
    const [visitorData, setVisitorData] = useState({ labels: [], data: [] });
    const [mostViewedProducts, setMostViewedProducts] = useState([]);
    const [totalVisitors, setTotalVisitors] = useState(0);
    const [totalProfileVisits, setTotalProfileVisits] = useState(0);
    const [sourceBreakdown, setSourceBreakdown] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch analytics data based on time range
    const fetchAnalyticsData = async (range) => {
        try {
            setLoading(true);

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!user || userError) {
                setLoading(false);
                return;
            }

            const now = new Date();
            let startDate;

            switch (range) {
                case '1month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '3months':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default: // 7 days
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            // First get the user's product IDs
            const { data: userProducts, error: productsError } = await supabase
                .from('products')
                .select('id')
                .eq('seller_id', user.id);

            if (productsError || !userProducts || userProducts.length === 0) {
                // Set default data if no products found
                setVisitorData({
                    labels: range === '7days' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] :
                        range === '1month' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] :
                            ['Month 1', 'Month 2', 'Month 3'],
                    data: [0, 0, 0, 0, 0, 0, 0]
                });
                setTotalVisitors(0);
                setTotalProfileVisits(0);
                setLoading(false);
                return;
            }

            const productIds = userProducts.map(p => p.id);

            console.log('Debug: Product IDs:', productIds);
            console.log('Debug: Start Date:', startDate.toISOString());
            console.log('Debug: End Date:', now.toISOString());

            // First try to get just created_at to see if basic query works
            let productViewsData = [];
            let profileViewsData = [];
            let sourceStats = {};

            try {
                // Try with source column first
                console.log('Debug: Trying to fetch with source column...');
                const [
                    { data: productViewsWithSource = [], error: productViewsError },
                    { data: profileViewsWithSource = [], error: profileViewsError }
                ] = await Promise.all([
                    supabase
                        .from('product_views')
                        .select('created_at, source')
                        .in('product_id', productIds)
                        .filter('created_at', 'gte', startDate.toISOString())
                        .filter('created_at', 'lte', now.toISOString()),
                    supabase
                        .from('profile_views')
                        .select('created_at, source')
                        .eq('profile_id', user.id)
                        .filter('created_at', 'gte', startDate.toISOString())
                        .filter('created_at', 'lte', now.toISOString())
                ]);

                if (productViewsError) {
                    console.log('Debug: Product views error with source:', productViewsError);
                    throw new Error(`Product views error: ${productViewsError.message}`);
                }
                if (profileViewsError) {
                    console.log('Debug: Profile views error with source:', profileViewsError);
                    throw new Error(`Profile views error: ${profileViewsError.message}`);
                }

                productViewsData = productViewsWithSource;
                profileViewsData = profileViewsWithSource;

                // Calculate source breakdown
                productViewsData?.forEach(view => {
                    const source = view.source || 'Unknown';
                    sourceStats[source] = (sourceStats[source] || 0) + 1;
                });

                console.log('Debug: Successfully fetched with source column');
                console.log('Debug: Product views count:', productViewsData.length);
                console.log('Debug: Profile views count:', profileViewsData.length);
                console.log('Debug: Source stats:', sourceStats);

            } catch (sourceError) {
                console.log('Debug: Source column query failed, trying without source...');
                
                // Fallback: try without source column
                const [
                    { data: productViewsBasic = [], error: productViewsBasicError },
                    { data: profileViewsBasic = [], error: profileViewsBasicError }
                ] = await Promise.all([
                    supabase
                        .from('product_views')
                        .select('created_at')
                        .in('product_id', productIds)
                        .filter('created_at', 'gte', startDate.toISOString())
                        .filter('created_at', 'lte', now.toISOString()),
                    supabase
                        .from('profile_views')
                        .select('created_at')
                        .eq('profile_id', user.id)
                        .filter('created_at', 'gte', startDate.toISOString())
                        .filter('created_at', 'lte', now.toISOString())
                ]);

                if (productViewsBasicError) {
                    console.log('Debug: Product views basic error:', productViewsBasicError);
                    throw new Error(`Product views basic error: ${productViewsBasicError.message}`);
                }
                if (profileViewsBasicError) {
                    console.log('Debug: Profile views basic error:', profileViewsBasicError);
                    throw new Error(`Profile views basic error: ${profileViewsBasicError.message}`);
                }

                productViewsData = productViewsBasic;
                profileViewsData = profileViewsBasic;
                sourceStats = { 'Unknown': productViewsData.length };

                console.log('Debug: Successfully fetched without source column');
                console.log('Debug: Product views count:', productViewsData.length);
                console.log('Debug: Profile views count:', profileViewsData.length);
            }

            // Process product views data for chart
            let labels = [];
            let data = [];

            if (range === '7days') {
                labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                data = new Array(7).fill(0);

                productViewsData?.forEach(view => {
                    const day = new Date(view.created_at).getDay();
                    data[day] += 1;
                });
            }
            else if (range === '1month') {
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = new Array(4).fill(0);

                productViewsData?.forEach(view => {
                    const date = new Date(view.created_at);
                    const week = Math.floor((date.getDate() - 1) / 7);
                    if (week >= 0 && week < 4) {
                        data[week] += 1;
                    }
                });
            }
            else {
                labels = ['Month 1', 'Month 2', 'Month 3'];
                data = new Array(3).fill(0);
                const currentDate = new Date();

                productViewsData?.forEach(view => {
                    const date = new Date(view.created_at);
                    const monthDiff = Math.floor((currentDate - date) / (30 * 24 * 60 * 60 * 1000));
                    if (monthDiff >= 0 && monthDiff < 3) {
                        data[2 - monthDiff] += 1;
                    }
                });
            }

            setVisitorData({ labels, data });
            setTotalVisitors(productViewsData?.length || 0);
            setTotalProfileVisits(profileViewsData?.length || 0);
            setSourceBreakdown(sourceStats);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Set default data on error
            setVisitorData({
                labels: timeRange === '7days' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] :
                    timeRange === '1month' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] :
                        ['Month 1', 'Month 2', 'Month 3'],
                data: [0, 0, 0, 0, 0, 0, 0]
            });
            setTotalVisitors(0);
            setTotalProfileVisits(0);
        } finally {
            setLoading(false);
        }
    };

    // Fetch current user's most viewed products (top 15)
    const fetchMostViewedProducts = async () => {
        try {
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (!user || userError) return;

            // First get the user's products with their view counts
            const { data: productsWithViews, error } = await supabase
                .rpc('get_user_products_with_views', {
                    user_id: user.id,
                    limit_count: 15
                });

            if (error || !productsWithViews) {
                console.log('Error fetching products with views:', error);
                // Fallback to showing user's recent products
                const { data: userProducts } = await supabase
                    .from('products')
                    .select(`
          id,
          product_name,
          price,
          product_images (image_url)
        `)
                    .eq('seller_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(15);

                const productsWithZeroViews = userProducts?.map(product => ({
                    ...product,
                    view_count: 0,
                    product_image: product.product_images?.[0]?.image_url
                })) || [];

                setMostViewedProducts(productsWithZeroViews);
                return;
            }

            // Format the data for display
            const formattedProducts = productsWithViews.map(product => ({
                ...product,
                product_image: product.product_images?.[0]?.image_url
            }));

            setMostViewedProducts(formattedProducts);
        } catch (error) {
            console.error('Error fetching most viewed products:', error);
            setMostViewedProducts([]);
        }
    };

    useEffect(() => {
        fetchAnalyticsData(timeRange);
        fetchMostViewedProducts();
    }, [timeRange]);

    const lineChartData = {
        labels: visitorData.labels,
        datasets: [
            {
                data: visitorData.data.length ? visitorData.data : [0],
                color: (opacity = 1) => `rgba(230, 138, 80, ${opacity})`,
                strokeWidth: 3
            }
        ],
    };

    const renderProductItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => {
                navigation.navigate('ProductDetail', { productId: item.id });
            }}
        >
            <View style={styles.productImageContainer}>
                <Image
                    source={
                        item.product_image
                            ? { uri: item.product_image }
                            : require('../assets/placeholder.jpg')
                    }
                    style={styles.productCardImage}
                    resizeMode="cover"
                />
                <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.viewsBadge}>
                    <MaterialIcons name="visibility" size={12} color="white" />
                    <Text style={styles.viewsText}>{item.view_count || 0}</Text>
                </View>
            </View>
            <View style={styles.productCardContent}>
                <Text style={styles.productCardTitle} numberOfLines={2}>
                    {item.product_name || 'Product Name'}
                </Text>
                <Text style={styles.productCardPrice}>₹{item.price || '0'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Beautiful Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Business Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Track your business performance</Text>
                    </View>
                    <View style={styles.headerDecoration}>
                        <MaterialIcons name="analytics" size={28} color="#E68A50" />
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#E68A50" />
                        <Text style={styles.loadingText}>Loading your analytics...</Text>
                    </View>
                ) : (
                    <>
                        {/* Beautiful Stats Cards */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <View style={styles.statIconBackground}>
                                        <MaterialIcons name="visibility" size={24} color="#E68A50" />
                                    </View>
                                </View>
                                <View style={styles.statContent}>
                                    <Text style={styles.statValue}>{totalVisitors}</Text>
                                    <Text style={styles.statTitle}>Product Views</Text>
                                    <Text style={styles.statSubtitle}>Total views on your products</Text>
                                </View>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <View style={[styles.statIconBackground, { backgroundColor: '#E8F5E8' }]}>
                                        <MaterialIcons name="person" size={24} color="#4CAF50" />
                                    </View>
                                </View>
                                <View style={styles.statContent}>
                                    <Text style={styles.statValue}>{totalProfileVisits}</Text>
                                    <Text style={styles.statTitle}>Profile Visits</Text>
                                    <Text style={styles.statSubtitle}>Visits to your profile page</Text>
                                </View>
                            </View>
                        </View>

                        {/* Enhanced Time Range Selector */}
                        <View style={styles.timeRangeContainer}>
                            <Text style={styles.timeRangeLabel}>Time Period</Text>
                            <View style={styles.timeRangeButtons}>
                                {[
                                    { key: '7days', label: '7 Days', icon: 'today' },
                                    { key: '1month', label: '1 Month', icon: 'date-range' },
                                    { key: '3months', label: '3 Months', icon: 'calendar-view-month' }
                                ].map((range) => (
                                    <TouchableOpacity
                                        key={range.key}
                                        style={[
                                            styles.timeRangeButton,
                                            timeRange === range.key && styles.activeTimeRange
                                        ]}
                                        onPress={() => setTimeRange(range.key)}
                                    >
                                        <MaterialIcons
                                            name={range.icon}
                                            size={16}
                                            color={timeRange === range.key ? '#fff' : '#E68A50'}
                                        />
                                        <Text style={[
                                            styles.timeRangeText,
                                            timeRange === range.key && styles.activeTimeRangeText
                                        ]}>
                                            {range.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Enhanced Chart Section */}
                        <View style={styles.chartSection}>
                            <View style={styles.chartHeader}>
                                <Text style={styles.sectionTitle}>
                                    Product Views Analytics
                                </Text>
                                <Text style={styles.chartSubtitle}>
                                    {timeRange === '7days' ? 'Last 7 Days' :
                                        timeRange === '1month' ? 'Last Month' : 'Last 3 Months'}
                                </Text>
                            </View>
                            <View style={styles.chartContainer}>
                                <LineChart
                                    data={lineChartData}
                                    width={screenWidth - 32}
                                    height={220}
                                    yAxisLabel=""
                                    chartConfig={{
                                        backgroundColor: '#ffffff',
                                        backgroundGradientFrom: '#ffffff',
                                        backgroundGradientTo: '#ffffff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(230, 138, 80, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                                        propsForDots: {
                                            r: '5',
                                            strokeWidth: '2',
                                            stroke: '#E68A50',
                                            fill: '#E68A50'
                                        },
                                        propsForBackgroundLines: {
                                            strokeDasharray: '',
                                            stroke: '#f0f0f0',
                                            strokeWidth: 1
                                        },
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            </View>
                        </View>

                        {/* Source Breakdown Section */}
                        <View style={styles.sourceBreakdownSection}>
                            <View style={styles.sourceBreakdownHeader}>
                                <MaterialIcons name="analytics" size={24} color="#E68A50" />
                                <View style={styles.sourceBreakdownTitleContainer}>
                                    <Text style={styles.sectionTitle}>Traffic Sources</Text>
                                    <Text style={styles.sourceBreakdownSubtitle}>Where your product views come from</Text>
                                </View>
                            </View>

                            <View style={styles.sourceBreakdownContainer}>
                                {Object.keys(sourceBreakdown).length > 0 ? (
                                    Object.entries(sourceBreakdown).map(([source, count]) => (
                                        <View key={source} style={styles.sourceItem}>
                                            <View style={styles.sourceIconContainer}>
                                                <MaterialIcons
                                                    name={source === 'Home' ? 'home' :
                                                        source === 'Profile' ? 'person' :
                                                            source === 'AllProducts' ? 'grid-view' :
                                                                source === 'ProductDetail' ? 'visibility' : 'analytics'}
                                                    size={20}
                                                    color="#E68A50"
                                                />
                                            </View>
                                            <View style={styles.sourceContent}>
                                                <Text style={styles.sourceName}>{source}</Text>
                                                <Text style={styles.sourceCount}>{count} views</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.noSourceDataContainer}>
                                        <Text style={styles.noSourceDataText}>No traffic data yet</Text>
                                        <Text style={styles.noSourceDataSubText}>Start promoting your products to see traffic sources!</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Enhanced Products Section */}
                        <View style={styles.productsSection}>
                            <View style={styles.productsSectionHeader}>
                                <MaterialIcons name="star" size={24} color="#E68A50" />
                                <View style={styles.productsSectionTitleContainer}>
                                    <Text style={styles.sectionTitle}>Top Performing Products</Text>
                                    <Text style={styles.productsSectionSubtitle}>Your 15 most viewed products</Text>
                                </View>
                            </View>

                            <View style={styles.productsContainer}>
                                {mostViewedProducts.length > 0 ? (
                                    <FlatList
                                        data={mostViewedProducts}
                                        renderItem={renderProductItem}
                                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                                        numColumns={2}
                                        scrollEnabled={false}
                                        contentContainerStyle={styles.productsGrid}
                                        columnWrapperStyle={styles.productRow}
                                        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                                    />
                                ) : (
                                    <View style={styles.noDataContainer}>
                                        <View style={styles.noDataIcon}>
                                            <MaterialIcons name="trending-up" size={48} color="#E68A50" />
                                        </View>
                                        <Text style={styles.noDataText}>No product views yet</Text>
                                        <Text style={styles.noDataSubText}>
                                            Start promoting your products to get views and track your performance!
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA'
    },
    scrollContainer: {
        paddingBottom: 30
    },
    // Enhanced Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500'
    },
    headerDecoration: {
        backgroundColor: '#FFF5F0',
        padding: 12,
        borderRadius: 15,
    },
    // Enhanced Stats Styles
    statsContainer: {
        paddingHorizontal: 20,
        marginBottom: 25
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#E68A50'
    },
    statIconContainer: {
        marginRight: 16
    },
    statIconBackground: {
        backgroundColor: '#FFF5F0',
        padding: 12,
        borderRadius: 15,
    },
    statContent: {
        flex: 1
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4
    },
    statTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495E',
        marginBottom: 2
    },
    statSubtitle: {
        fontSize: 12,
        color: '#7F8C8D'
    },
    // Enhanced Time Range Styles
    timeRangeContainer: {
        paddingHorizontal: 20,
        marginBottom: 25
    },
    timeRangeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12
    },
    timeRangeButtons: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    timeRangeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'transparent'
    },
    activeTimeRange: {
        backgroundColor: '#E68A50',
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    timeRangeText: {
        color: '#E68A50',
        fontWeight: '600',
        fontSize: 13,
        marginLeft: 6
    },
    activeTimeRangeText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    // Enhanced Chart Styles
    chartSection: {
        paddingHorizontal: 20,
        marginBottom: 25
    },
    chartHeader: {
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 4
    },
    chartSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500'
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    chart: {
        borderRadius: 15
    },
    // Source Breakdown Styles
    sourceBreakdownSection: {
        paddingHorizontal: 20,
        marginBottom: 25
    },
    sourceBreakdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    sourceBreakdownTitleContainer: {
        marginLeft: 12,
        flex: 1
    },
    sourceBreakdownSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500'
    },
    sourceBreakdownContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    sourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 8,
    },
    sourceIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sourceContent: {
        flex: 1,
    },
    sourceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 2,
    },
    sourceCount: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    noSourceDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    noSourceDataText: {
        fontSize: 16,
        color: '#7F8C8D',
        fontWeight: '600',
        marginBottom: 8,
    },
    noSourceDataSubText: {
        fontSize: 14,
        color: '#A0A0A0',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Enhanced Products Styles
    productsSection: {
        paddingHorizontal: 20
    },
    productsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    productsSectionTitleContainer: {
        marginLeft: 12,
        flex: 1
    },
    productsSectionSubtitle: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500'
    },
    productsContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    productsGrid: {
        paddingHorizontal: 0,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 4,
        flex: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    productImageContainer: {
        position: 'relative',
        height: 130,
    },
    productCardImage: {
        width: '100%',
        height: '100%',
    },
    rankBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#E68A50',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 6,
        shadowColor: '#E68A50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    rankText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    viewsBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewsText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    productCardContent: {
        padding: 14,
    },
    productCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
        lineHeight: 18,
    },
    productCardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E68A50',
    },
    // Enhanced No Data Styles
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    noDataIcon: {
        backgroundColor: '#FFF5F0',
        padding: 20,
        borderRadius: 25,
        marginBottom: 16
    },
    noDataText: {
        fontSize: 18,
        color: '#2C3E50',
        fontWeight: '600',
        marginBottom: 8,
    },
    noDataSubText: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20
    },
    // Enhanced Loading Styles
    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#7F8C8D',
        marginTop: 16,
        fontWeight: '500'
    }
});

export default DashboardScreen;