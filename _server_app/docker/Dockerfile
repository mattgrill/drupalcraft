# Start from the Phusion Base Image
FROM phusion/baseimage:0.9.15

# Set correct environment variables.
ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive

# Regenerate SSH host keys. baseimage-docker does not contain any, so you
# have to do that yourself. You may also comment out this instruction; the
# init system will auto-generate one during boot.
RUN /etc/my_init.d/00_regen_ssh_host_keys.sh

# UPATE APT-GET
RUN apt-get update

# SSH
#ADD conf/authorized_keys /tmp/authorized_keys
#RUN mv /tmp/authorized_keys /root/.ssh/authorized_keys
RUN curl http://fourword.fourkitchens.com/authorized_keys >> /root/.ssh/authorized_keys

##
## BUILD
##

# INSTALL SUPERVISOR
RUN apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor

# INSTALL APACHE 2
RUN apt-get install -y apache2

# INSTALL PHP-THINGS
RUN apt-get install -y libapache2-mod-php5 php5-mysql php-apc php5-gd php5-memcache memcached php-pear

# INSTALL DRUSH
RUN pear channel-discover pear.drush.org && pear install drush/drush

# INSTALL GIT
RUN apt-get install -y git

##
## CONFIGURATION
##

# SUPERVISOR CONF
ADD conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# APACHE CONFIGURATION
RUN ln -s /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled/rewrite.load
RUN rm -f /etc/apache2/sites-enabled/000-default.conf
ADD conf/drupal.conf /etc/apache2/sites-available/drupal.conf
RUN ln -s /etc/apache2/sites-available/drupal.conf /etc/apache2/sites-enabled/drupal.conf

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /var/tmp/*

# EXPOSE 22 80
EXPOSE 22 80

# WHAT THE CONTAINER RUNS
CMD ["/usr/bin/supervisord"]

# docker run -v /var/run/mysqld/mysqld.sock:/var/run/mysqld/mysqld.sock -v ~/docker/mount:/tmp/www -p 80:80 -p 22 -d 8fbd06198093
