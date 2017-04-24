FROM ubuntu

RUN apt-get update \
    && apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get update \
  	&& apt-get install --no-install-recommends --no-install-suggests -y \
                       ca-certificates nginx gettext-base nodejs \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 80 443

COPY docker/nginx/entrypoint.sh /opt/
COPY files/ /opt/app

RUN chmod +x /opt/entrypoint.sh
RUN mkdir -p /opt/certificates


CMD ["/opt/entrypoint.sh"]
