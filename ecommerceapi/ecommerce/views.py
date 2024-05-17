from rest_framework import viewsets, generics, status, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from ecommerce import serializers, paginators, perms
from ecommerce.models import Category, Product, ProductComment, ProductRating, Store, StoreComment, StoreRating, User, Tag, Order, OrderDetail


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer

    @action(methods=['get'], url_path='products', detail=True)
    def get_products(self, request, pk):
        products = self.get_object().products_cate.filter(active=True)
        return Response(serializers.ProductSerializer(products, many=True).data)

class ProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Product.objects.filter(active=True)
    serializer_class = serializers.ProductDetailsSerializer
    pagination_class = paginators.ProductPaginator

    def get_queryset(self):
        queryset = self.queryset
        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(name__icontains=q) | queryset.filter(store_name__icontains=q)

            cate_id = self.request.query_params.get('category_id')
            if cate_id:
                queryset = queryset.filter(category_id=cate_id)

            store_id = self.request.query_params.get('store_id')
            if store_id:
                queryset = queryset.filter(store_id=store_id)

        return queryset

    def get_permissions(self):
        if self.action in ['add_productcomment'] or self.action in ['add_productrating']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]
    @action(methods=['post'], url_path='add-comment', detail=True)
    def add_productcomment(self, request, pk):
        c = self.get_object().productcomment_set.create(content=request.data.get('content'), buyer=request.user)
        return Response(serializers.ProductCommentSerializer(c).data, status=status.HTTP_201_CREATED)
    @action(methods=['get'], url_path='comments', detail=True)
    def get_productcomments(self, request, pk):
        comments = self.get_object().productcomment_set.select_related('buyer').order_by('-id')
        paginator = paginators.ReviewPaginator()

        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.ProductCommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.ProductCommentSerializer(comments, many=True).data)
    @action(methods=['post'], url_path='tags', detail=True)
    def add_tags(self, request, pk):
        product = self.get_object()
        serializer = serializers.TagSerializer(data=request.data)
        if serializer.is_valid():
            tag_name = serializer.validated_data.get('name')

            try:
                tag = Tag.objects.get(name=tag_name)
            except Tag.DoesNotExist:
                tag = Tag.objects.create(name=tag_name)

            if product.tags.filter(name=tag_name).exists():
                return Response({"message": "Tag already exists for this product"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                product.tags.add(tag)
                product.save()

                return Response(serializers.TagSerializer(tag).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @action(methods=['get'], url_path='ratings', detail=True)
    def get_productratings(self, request, pk):
        ratings = self.get_object().productrating_set.select_related('buyer').order_by('-id')
        paginator = paginators.ReviewPaginator()

        page = paginator.paginate_queryset(ratings, request)
        if page is not None:
            serializer = serializers.ProductRatingSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.ProductRatingSerializer(ratings, many=True).data)
    @action(methods=['post'], url_path='add-rating', detail=True)
    def add_productrating(self, request, pk):
        c = self.get_object().productrating_set.create(rating=request.data.get('rating'), buyer=request.user)
        return Response(serializers.ProductRatingSerializer(c).data, status=status.HTTP_201_CREATED)


class StoreViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Store.objects.filter(active=True)
    serializer_class = serializers.StoreSerializer
    def get_permissions(self):
        if self.action in ['add_storecomment'] or self.action in ['add_storerating']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]
    @action(methods=['get'], url_path='products', detail=True)
    def get_products(self, request, pk):
        products = self.get_object().products_store.filter(active=True)
        q = request.query_params.get('q')
        if q:
            products = products.filter(name__icontains=q)
        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            products = products.filter(category_id=cate_id)

        return Response(serializers.ProductSerializer(products, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='add-comment', detail=True)
    def add_storecomment(self, request, pk):
        c = self.get_object().storecomment_set.create(content=request.data.get('content'), buyer=request.user)
        return Response(serializers.StoreCommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='comments', detail=True)
    def get_storecomments(self, request, pk):
        comments = self.get_object().storecomment_set.select_related('buyer').order_by('-id')
        paginator = paginators.ReviewPaginator()
        page = paginator.paginate_queryset(comments, request)

        if page is not None:
            serializer = serializers.StoreCommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.StoreCommentSerializer(comments, many=True).data)

    @action(methods=['get'], url_path='ratings', detail=True)
    def get_storeratings(self, request, pk):
        ratings = self.get_object().storerating_set.select_related('buyer').order_by('-id')
        paginator = paginators.ReviewPaginator()

        page = paginator.paginate_queryset(ratings, request)
        if page is not None:
            serializer = serializers.StoreRatingSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.StoreRatingSerializer(ratings, many=True).data)

    @action(methods=['post'], url_path='add-rating', detail=True)
    def add_storerating(self, request, pk):
        c = self.get_object().storerating_set.create(rating=request.data.get('rating'), buyer=request.user)
        return Response(serializers.StoreRatingSerializer(c).data, status=status.HTTP_201_CREATED)
class StoreCommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = StoreComment.objects.all()
    serializer_class = serializers.StoreCommentSerializer
    permission_classes = [perms.CommentOwner]

class StoreRatingViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = StoreRating.objects.all()
    serializer_class = serializers.StoreRatingSerializer
    permission_classes = [perms.RatingOwner]

class ProductCommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = ProductComment.objects.all()
    serializer_class = serializers.ProductCommentSerializer
    permission_classes = [perms.CommentOwner]

class ProductRatingViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = ProductRating.objects.all()
    serializer_class = serializers.ProductRatingSerializer
    permission_classes = [perms.RatingOwner]

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser,]

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):

            for k,v in request.data.items():
                setattr(user, k, v)
            user.save()
        return Response(serializers.UserSerializer(user).data)
    # @action(methods=['get'], url_path='orders', detail=True)
    # def get_orders(self, request, pk):
    #     orders = Order.objects.filter(buyer=request.user)
    #     return Response(serializers.OrderSerializer(orders).data)


class OrderViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Order.objects.filter(active=True)
    serializer_class = serializers.OrderSerializer
